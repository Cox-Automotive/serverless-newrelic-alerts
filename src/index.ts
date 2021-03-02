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
import { Alert, NewrelicAlertsConfig, ResourceAlertOverride } from './types/newrelic-alerts-config'
import getInfrastructureCondition from './conditions/infrastructure'
import { ApiGatewayAlert, DynamoDbAlert, FunctionAlert, SqsAlert } from './constants/alerts'
import isAlertOfType from './utils/is-alert-of-type'
import { AlertsSet, AlertsSetMapping } from './constants/alerts-set'

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
      'after:aws:package:finalize:mergeCustomProviderResources': this.compile.bind(this)
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
      .filter(alert => isAlertOfType(alert, FunctionAlert))
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
      .filter(alert => isAlertOfType(alert, ApiGatewayAlert))
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

  getSqsAlertsCloudFormation(alerts: Alert[], infrastructureConditionServiceToken: string) {
    const dlqs = Object.values(
      this.serverless.service.provider.compiledCloudFormationTemplate.Resources
    )
      .filter(
        ({ Type: type, Properties: { QueueName: name } }) =>
          type === 'AWS::SQS::Queue' && name && name.endsWith('-dlq')
      )
      .map(({ Properties: { QueueName: name } }) => name)

    if (!dlqs.length) {
      return {}
    }

    const sqsAlerts = alerts.filter(alert => isAlertOfType(alert, SqsAlert)) as SqsAlert[]
    return sqsAlerts
      .filter(alert => [SqsAlert.DLQ_VISIBLE_MESSAGES].includes(alert))
      .reduce((statements, alert) => {
        return {
          ...statements,
          ...this.getInfrastructureConditionCloudFormation(
            infrastructureConditionServiceToken,
            alert,
            dlqs
          )
        }
      }, {})
  }

  getDynamoDbAlertsCloudFormation(alerts: Alert[], infrastructureConditionServiceToken: string) {
    const tables = Object.values(
      this.serverless.service.provider.compiledCloudFormationTemplate.Resources
    )
      .filter(({ Type: type }) => type === 'AWS::DynamoDB::Table')
      .map(({ Properties: { TableName: name } }) => name)

    if (!tables.length) {
      return {}
    }

    return alerts
      .filter(alert => Object.values<Alert>(DynamoDbAlert).includes(alert))
      .reduce((statements, alert) => {
        return {
          ...statements,
          ...this.getInfrastructureConditionCloudFormation(
            infrastructureConditionServiceToken,
            alert,
            tables
          )
        }
      }, {})
  }

  compile() {
    if (!this.serverless.service.custom || !this.serverless.service.custom.newrelicAlerts) {
      return
    }

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

    const expandedAlerts = alerts.reduce<Alert[]>((acc, alert) => {
      if (isAlertOfType(alert, AlertsSet)) {
        acc.push(...AlertsSetMapping[alert])
      } else {
        acc.push(alert)
      }
      return acc
    }, [])

    Object.assign(this.serverless.service.provider.compiledCloudFormationTemplate.Resources, {
      ...this.getPolicyCloudFormation(policyServiceToken),
      ...this.getFunctionAlertsCloudFormation(expandedAlerts, infrastructureConditionServiceToken),
      ...this.getApiGatewayAlertsCloudFormation(
        expandedAlerts,
        infrastructureConditionServiceToken
      ),
      ...this.getSqsAlertsCloudFormation(expandedAlerts, infrastructureConditionServiceToken),
      ...this.getDynamoDbAlertsCloudFormation(expandedAlerts, infrastructureConditionServiceToken)
    })
  }
}

module.exports = NewRelicAlertsPlugin
