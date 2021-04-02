import Plugin from 'serverless/classes/Plugin'
import AwsProvider from 'serverless/plugins/aws/provider/awsProvider'
import Serverless from 'serverless'
import { upperCase, isString, isUndefined } from 'lodash'

import {
  getNormalizedInfrastructureConditionName,
  getNormalizedName,
  getNormalizedPolicyName
} from './utils/name-normalizer'
import { NewRelicConfig } from './types/newrelic-config'
import { AlertType, Alert, ResourceAlertOverride } from './types/alert'
import getInfrastructureCondition from './conditions/infrastructure'
import { FunctionAlert, SqsAlert } from './constants/alerts'
import { getAlertTitle, isAlertOfType, isValidType } from './utils/alert'
import { AlertsSet, AlertsSetMapping } from './constants/alerts-set'
import { namespaceMapping } from './constants/namespace-mapping'

class NewRelicPlugin implements Plugin {
  serverless: Serverless
  awsProvider: AwsProvider
  hooks: Plugin.Hooks
  serviceName: string
  policyName: string
  policyServiceToken: string
  infrastructureConditionServiceToken: string
  violationCloseTimer?: number
  globalAlerts: Alert[]
  alertDefinitions: Alert[]

  constructor(serverless: Serverless) {
    this.serverless = serverless
    this.awsProvider = this.serverless.getProvider('aws')
    this.serviceName = `${getNormalizedName(this.serverless.service.getServiceName())} ${upperCase(
      this.awsProvider.getStage()
    )}`
    this.policyName = getNormalizedPolicyName(this.serviceName)

    if (this.serverless.service.custom && this.serverless.service.custom.newrelic) {
      const {
        policyServiceToken,
        infrastructureConditionServiceToken,
        violationCloseTimer,
        alerts = []
      }: NewRelicConfig = this.serverless.service.custom.newrelic
      if (!policyServiceToken || !infrastructureConditionServiceToken) {
        throw Error(
          'newrelic alerts plugin requires both policyServiceToken and infrastructureConditionServiceToken'
        )
      }

      this.hooks = {
        'after:aws:package:finalize:mergeCustomProviderResources': this.compile.bind(this)
      }

      this.policyServiceToken = policyServiceToken
      this.infrastructureConditionServiceToken = infrastructureConditionServiceToken
      this.violationCloseTimer = violationCloseTimer
      this.globalAlerts = this.getGlobalAlerts(alerts)
    } else {
      this.hooks = {}
    }
  }

  getPolicyCloudFormation(incidentPreference) {
    return {
      [this.policyName]: {
        Type: 'Custom::NewRelicPolicy',
        Properties: {
          ServiceToken: this.policyServiceToken,
          policy: {
            name: this.serviceName,
            incident_preference: incidentPreference
          }
        }
      }
    }
  }

  getInfrastructureConditionCloudFormation(alert: Alert) {
    return {
      [`${getNormalizedInfrastructureConditionName(alert.title)}`]: {
        Type: 'Custom::NewRelicInfrastructureCondition',
        Properties: {
          ServiceToken: this.infrastructureConditionServiceToken,
          ...getInfrastructureCondition(alert, this.serviceName, this.policyName)
        }
      }
    }
  }

  getLocalFunctionAlerts() {
    const functions = this.serverless.service.getAllFunctions()

    return functions.reduce((functionAlerts: Alert[], functionName: string) => {
      const { alerts = [], name } = this.serverless.service.getFunction(
        functionName
      ) as Serverless.FunctionDefinition & ResourceAlertOverride

      alerts.forEach(alert => {
        const alertType = isString(alert) ? alert : alert.type

        functionAlerts.push(
          this.createAlert(
            alert,
            alertType,
            getAlertTitle(alert, `${functionName} - ${alertType}`),
            [name]
          )
        )
      })

      return functionAlerts
    }, [])
  }

  getGlobalFunctionAlerts(localFunctionAlerts) {
    const functions: string[] = this.serverless.service.getAllFunctions() || []
    const resources: string[] = []
    const globalAlertList = this.globalAlerts.filter(alert =>
      isAlertOfType(alert.type, FunctionAlert)
    )
    const globalFunctionAlerts: Alert[] = []

    functions.forEach(lambdaFunction => {
      const { name } = this.serverless.service.getFunction(lambdaFunction)
      resources.push(name)
    })

    globalAlertList.forEach(globalAlert => {
      let filteredResources = []

      localFunctionAlerts.forEach(localFunctionAlert => {
        if (localFunctionAlert.type === globalAlert.type) {
          filteredResources = filteredResources.concat(localFunctionAlert.resources)
        }
      })

      globalFunctionAlerts.push({
        ...globalAlert,
        resources: resources.filter(function(elem) {
          return this.indexOf(elem) < 0
        }, filteredResources)
      })
    })

    return globalFunctionAlerts
  }

  convertToCloudFormation(alerts: Alert[]) {
    let cloudFormation = {}

    alerts.forEach(functionAlert => {
      cloudFormation = {
        ...cloudFormation,
        ...this.getInfrastructureConditionCloudFormation(functionAlert)
      }
    })

    return cloudFormation
  }

  getFunctionAlertsCloudFormation() {
    let localFunctionAlerts = this.getLocalFunctionAlerts()
    let globalFunctionAlerts = this.getGlobalFunctionAlerts(localFunctionAlerts)

    localFunctionAlerts = localFunctionAlerts.filter(alert => alert.resources.length > 0)
    globalFunctionAlerts = globalFunctionAlerts.filter(alert => alert.resources.length > 0)

    console.info('localFunctionAlerts=', localFunctionAlerts)
    console.info('globalFunctionAlerts=', globalFunctionAlerts)

    const localConditionStatements = this.convertToCloudFormation(localFunctionAlerts)
    const globalConditionStatements = this.convertToCloudFormation(globalFunctionAlerts)

    return {
      ...localConditionStatements,
      ...globalConditionStatements
    }
  }

  getAlertsCloudFormation(namespace) {
    const propertyName = namespaceMapping[namespace].propertyName
    const alertType = namespaceMapping[namespace].alertType

    let globalAlerts = this.globalAlerts.filter(alert => isAlertOfType(alert.type, alertType))

    globalAlerts.forEach(alert => {
      let resources = Object.values(
        this.serverless.service.provider.compiledCloudFormationTemplate.Resources || {}
      )
        .filter(({ Type: type }) => type === namespace)
        .map(({ Properties: { [propertyName]: name } }) => name)

      if (alert.filter) {
        resources = resources.filter(resource => resource.indexOf(alert.filter) !== -1)
      }

      alert.resources = resources
    })

    globalAlerts = globalAlerts.filter(alert => alert.resources.length > 0)

    console.info(`${namespace} global alerts=`, globalAlerts)

    const globalConditionStatements = this.convertToCloudFormation(globalAlerts)

    return {
      ...globalConditionStatements
    }
  }

  createAlert(
    alertConfig: Alert | string,
    alertType: AlertType,
    alertTitle: string,
    resources: string[]
  ) {
    const alertEnabled = isString(alertConfig) || alertConfig.enabled
    const violationCloseTimer =
      !isString(alertConfig) && alertConfig.violationCloseTimer
        ? alertConfig.violationCloseTimer
        : this.violationCloseTimer || 24

    const alert: Alert = {
      type: alertType,
      enabled: isUndefined(alertEnabled) ? true : alertEnabled,
      resources,
      violationCloseTimer,
      title: alertTitle
    }

    if (!isString(alertConfig) && alertConfig.runbookURL) {
      alert.runbookURL = alertConfig.runbookURL
    }

    if (!isString(alertConfig) && alertConfig.filter) {
      alert.filter = alertConfig.filter
    }

    return alert
  }

  getGlobalAlerts(alerts: (AlertType | AlertsSet)[]) {
    const globalAlerts: Alert[] = []

    alerts.forEach((alert: any) => {
      const alertType = isString(alert) ? alert : alert.type

      if (isValidType(alertType)) {
        const alertTypes: AlertType[] = []

        if (!isAlertOfType(alertType, AlertsSet)) {
          alertTypes.push(alertType)
        } else {
          alertTypes.push(...AlertsSetMapping[alertType])
        }

        alertTypes.forEach(alertMetric => {
          globalAlerts.push(
            this.createAlert(alert, alertMetric, getAlertTitle(alert, alertMetric), [])
          )
        })
      } else {
        this.serverless.cli.log(`newrelic-alerts: unknown alert '${alert}'`)
      }
    }, [])

    return globalAlerts
  }

  compile() {
    Object.assign(this.serverless.service.provider.compiledCloudFormationTemplate.Resources, {
      ...this.getPolicyCloudFormation(
        this.serverless.service.custom.newrelic.incidentPreference || 'PER_POLICY'
      ),
      ...this.getFunctionAlertsCloudFormation(),
      ...this.getAlertsCloudFormation('AWS::ApiGateway::RestApi'),
      ...this.getAlertsCloudFormation('AWS::SQS::Queue'),
      ...this.getAlertsCloudFormation('AWS::DynamoDB::Table')
    })
  }
}

module.exports = NewRelicPlugin
