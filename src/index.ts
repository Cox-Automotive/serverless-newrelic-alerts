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

  checkEligibility(alerts: Alert[], resources: string[]) {
    if (!resources.length) {
      if (alerts.length) {
        this.serverless.cli.log(`newrelic-alerts: no resources found for ${alerts.toString()}`)
      }

      return false
    }

    return Boolean(alerts.length)
  }

  getFunctionAlertsCloudFormation(alerts: Alert[], infrastructureConditionServiceToken: string) {
    const functionsNames = this.serverless.service.getAllFunctionsNames()
    const functionAlerts = alerts.filter(alert => isAlertOfType(alert, FunctionAlert))

    const hasGlobalAlerts = this.checkEligibility(functionAlerts, functionsNames)

    const functions = this.serverless.service.getAllFunctions()
    const localAlerts = functions.reduce<Record<string, Record<string, boolean>>>(
      (acc, functionName) => {
        const { alerts = [], name } = this.serverless.service.getFunction(
          functionName
        ) as Serverless.FunctionDefinition & ResourceAlertOverride

        alerts.forEach(alert => {
          const alertName = isString(alert) ? alert : alert.name
          if (!isAlertOfType(alertName, FunctionAlert)) {
            this.serverless.cli.log(`newrelic-alerts: ${alertName} is not function alert`)
            return
          }

          acc[alertName] = acc[alertName] || {}
          acc[alertName][name] = isString(alert) || alert.enabled
        })

        return acc
      },
      {}
    )

    const globalConditionStatements = hasGlobalAlerts
      ? functionAlerts.reduce((statements, alert) => {
          return {
            ...statements,
            ...this.getInfrastructureConditionCloudFormation(
              infrastructureConditionServiceToken,
              alert,
              functionsNames.filter(
                functionName =>
                  !localAlerts[alert] ||
                  localAlerts[alert][functionName] === undefined ||
                  localAlerts[alert][functionName]
              )
            )
          }
        }, {})
      : {}

    const functionalConditionStatements = Object.entries(localAlerts).reduce(
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
    const apiGatewayAlerts = alerts.filter(alert => isAlertOfType(alert, ApiGatewayAlert))

    if (!this.checkEligibility(apiGatewayAlerts, apiGateways)) {
      return {}
    }

    return apiGatewayAlerts.reduce((statements, alert) => {
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
    const sqsAlerts = alerts.filter(alert => isAlertOfType(alert, SqsAlert)) as SqsAlert[]
    const dlqAlerts = sqsAlerts.filter(alert => [SqsAlert.DLQ_VISIBLE_MESSAGES].includes(alert))

    if (!this.checkEligibility(dlqAlerts, dlqs)) {
      return {}
    }

    return dlqAlerts.reduce((statements, alert) => {
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
    const dynamoDbAlerts = alerts.filter(alert =>
      Object.values<Alert>(DynamoDbAlert).includes(alert)
    )

    if (!this.checkEligibility(dynamoDbAlerts, tables)) {
      return {}
    }

    return dynamoDbAlerts.reduce((statements, alert) => {
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

  getAlerts(alerts: (Alert | AlertsSet)[]) {
    const validAlerts = [
      ...Object.values(FunctionAlert),
      ...Object.values(DynamoDbAlert),
      ...Object.values(ApiGatewayAlert),
      ...Object.values(SqsAlert)
    ]
    return alerts.reduce<Alert[]>((acc, alert) => {
      if (isAlertOfType(alert, AlertsSet)) {
        acc.push(...AlertsSetMapping[alert])
      } else if (validAlerts.includes(alert)) {
        acc.push(alert)
      } else {
        this.serverless.cli.log(`newrelic-alerts: unknown alert '${alert}'`)
      }

      return acc
    }, [])
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

    const filteredAlerts = this.getAlerts(alerts)
    Object.assign(this.serverless.service.provider.compiledCloudFormationTemplate.Resources, {
      ...this.getPolicyCloudFormation(policyServiceToken),
      ...this.getFunctionAlertsCloudFormation(filteredAlerts, infrastructureConditionServiceToken),
      ...this.getApiGatewayAlertsCloudFormation(
        filteredAlerts,
        infrastructureConditionServiceToken
      ),
      ...this.getSqsAlertsCloudFormation(filteredAlerts, infrastructureConditionServiceToken),
      ...this.getDynamoDbAlertsCloudFormation(filteredAlerts, infrastructureConditionServiceToken)
    })
  }
}

module.exports = NewRelicAlertsPlugin
