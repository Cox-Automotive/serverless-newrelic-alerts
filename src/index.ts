import Plugin from 'serverless/classes/Plugin'
import AwsProvider from 'serverless/plugins/aws/provider/awsProvider'
import Serverless from 'serverless'
import startCase from 'lodash/startCase'
import upperCase from 'lodash/upperCase'
import isString from 'lodash/isString'

import {
  getNormalizedInfrastructureConditionName,
  getNormalizedName,
  getNormalizedPolicyName
} from './utils/name-normalizer'
import { NewrelicAlertsConfig, Alert, ResourceAlertOverride } from './types/newrelic-alerts-config'
import getInfrastructureCondition from './conditions/infrastructure'
import { ApiGatewayAlert, FunctionAlert } from './constants/alerts'

class NewRelicAlertsPlugin implements Plugin {
  serverless: Serverless
  awsProvider: AwsProvider
  hooks: Plugin.Hooks
  serviceName: string
  alertName: string
  policyName: string

  constructor(serverless: Serverless) {
    this.serverless = serverless
    this.awsProvider = this.serverless.getProvider('aws')
    this.serviceName = getNormalizedName(this.serverless.service.getServiceName())
    this.alertName = `${this.serviceName} ${upperCase(this.awsProvider.getStage())}`
    this.policyName = getNormalizedPolicyName(this.serviceName)

    this.hooks = {
      'package:compileEvents': this.compile.bind(this)
    }
  }

  getPolicyCloudFormation(policyServiceToken: string) {
    return {
      [this.policyName]: {
        Type: 'Custom::NewRelicPolicy',
        Properties: {
          ServiceToken: policyServiceToken,
          policy: {
            name: this.alertName,
            incident_preference: 'PER_POLICY'
          }
        }
      }
    }
  }

  getInfrastructureConditionCloudFormation(
    infrastructureConditionServiceToken: string,
    alert: Alert,
    functionNames: string[]
  ) {
    return {
      [`${getNormalizedInfrastructureConditionName(alert)}`]: {
        Type: 'Custom::NewRelicInfrastructureCondition',
        Properties: {
          ServiceToken: infrastructureConditionServiceToken,
          ...getInfrastructureCondition(
            alert,
            this.policyName,
            `${this.alertName} - ${startCase(alert)}`,
            functionNames
          )
        }
      }
    }
  }

  getFunctionAlertsCloudFormation(alerts: Alert[], infrastructureConditionServiceToken: string) {
    const functionsNames = this.serverless.service.getAllFunctionsNames()

    if (!functionsNames.length) {
      return {}
    }

    const functions = this.serverless.service.getAllFunctions()
    const functionalAlerts = functions.reduce<Record<string, Record<string, boolean>>>(
      (acc, functionName) => {
        const { alerts = [], name } = this.serverless.service.getFunction(
          functionName
        ) as Serverless.FunctionDefinition & ResourceAlertOverride

        alerts.forEach(alert => {
          const alertName = isString(alert) ? alert : alert.name
          acc[alertName] = acc[alertName] || {}
          acc[alertName][name] = isString(alert) || alert.enabled
        })

        return acc
      },
      {}
    )

    const globalConditionStatements = alerts
      .filter(alert => Object.values<Alert>(FunctionAlert).includes(alert))
      .reduce((statements, alert) => {
        return {
          ...statements,
          ...this.getInfrastructureConditionCloudFormation(
            infrastructureConditionServiceToken,
            alert,
            functionsNames.filter(
              functionName =>
                !functionalAlerts[alert] ||
                functionalAlerts[alert][functionName] === undefined ||
                functionalAlerts[alert][functionName]
            )
          )
        }
      }, {})

    const functionalConditionStatements = Object.entries(functionalAlerts).reduce(
      (statements, [alert, functions]) => {
        return {
          ...statements,
          ...this.getInfrastructureConditionCloudFormation(
            infrastructureConditionServiceToken,
            alert as Alert,
            Object.entries(functions)
              .filter(([functionName, isAlertEnabled]) => isAlertEnabled)
              .map(([functionName]) => functionName)
          )
        }
      },
      {}
    )

    return {
      ...functionalConditionStatements,
      ...globalConditionStatements
    }
  }

  getApiGatewayAlertsCloudFormation(alerts: Alert[], infrastructureConditionServiceToken: string) {
    const apiGateways = Object.values(
      this.serverless.service.provider.compiledCloudFormationTemplate.Resources
    )
      .filter(({ Type: type }) => type === 'AWS::ApiGateway::RestApi')
      .map(({ Properties: { Name: name } }) => name)

    if (!apiGateways.length) {
      return {}
    }

    return alerts
      .filter(alert => Object.values<Alert>(ApiGatewayAlert).includes(alert))
      .reduce((statements, alert) => {
        return {
          ...statements,
          ...this.getInfrastructureConditionCloudFormation(
            infrastructureConditionServiceToken,
            alert,
            apiGateways
          )
        }
      }, {})
  }

  compile() {
    const {
      policyServiceToken,
      infrastructureConditionServiceToken,
      alerts = []
    }: NewrelicAlertsConfig = this.serverless.service.custom.newrelicAlerts
    if (!policyServiceToken || !infrastructureConditionServiceToken) {
      throw Error(
        'newrelic alerts plugin requires both policyServiceToken and infrastructureConditionServiceToken'
      )
    }

    Object.assign(this.serverless.service.provider.compiledCloudFormationTemplate.Resources, {
      ...this.getPolicyCloudFormation(policyServiceToken),
      ...this.getFunctionAlertsCloudFormation(alerts, infrastructureConditionServiceToken),
      ...this.getApiGatewayAlertsCloudFormation(alerts, infrastructureConditionServiceToken)
    })
  }
}

module.exports = NewRelicAlertsPlugin
