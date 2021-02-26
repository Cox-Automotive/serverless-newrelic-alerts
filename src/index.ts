import Plugin from 'serverless/classes/Plugin'
import AwsProvider from 'serverless/plugins/aws/provider/awsProvider'
import Serverless from 'serverless'
import startCase from 'lodash/startCase'
import upperCase from 'lodash/upperCase'

import {
  getNormalizedInfrastructureConditionName,
  getNormalizedName,
  getNormalizedPolicyName
} from './utils/name-normalizer'
import { NewrelicAlertsConfig, Alert } from './types/newrelic-alerts-config'
import getInfrastructureCondition from './conditions/infrastructure'

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

  compile() {
    const {
      policyServiceToken,
      infrastructureConditionServiceToken,
      alerts = []
    }: NewrelicAlertsConfig = this.serverless.service.custom.newrelicAlerts
    const functionsNames = this.serverless.service.getAllFunctionsNames()

    if (!policyServiceToken || !infrastructureConditionServiceToken) {
      throw Error(
        'newrelic alerts plugin requires both policyServiceToken and infrastructureConditionServiceToken'
      )
    }

    const policyStatement = this.getPolicyCloudFormation(policyServiceToken)
    const infrastructureConditionStatements = alerts.reduce((statements, alert) => {
      return {
        ...statements,
        ...this.getInfrastructureConditionCloudFormation(
          infrastructureConditionServiceToken,
          alert,
          functionsNames
        )
      }
    }, {})

    Object.assign(this.serverless.service.provider.compiledCloudFormationTemplate.Resources, {
      ...policyStatement,
      ...infrastructureConditionStatements
    })
  }
}

module.exports = NewRelicAlertsPlugin
