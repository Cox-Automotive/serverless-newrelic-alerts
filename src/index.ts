import Plugin from 'serverless/classes/Plugin'
import AwsProvider from 'serverless/plugins/aws/provider/awsProvider'
import Serverless from 'serverless'
import {
  AlertPolicy,
  InfrastructureCondition,
  NrqlCondition,
  AlertsParams,
  FilterItem
} from './types/alert'

import {
  getNormalizedFilterItemName,
  getNormalizedInfrastructureConditionName,
  getNormalizedNrqlConditionName,
  getNormalizedPolicyName
} from './utils/name-normalizer'

class ServerlessPlugin implements Plugin {
  serverless: Serverless
  options: Serverless.Options
  awsProvider: AwsProvider
  providerNaming: any
  hooks: Plugin.Hooks

  constructor(serverless: Serverless, options: Serverless.Options) {
    this.serverless = serverless
    this.awsProvider = this.serverless.getProvider('aws')
    this.providerNaming = this.awsProvider.naming
    this.options = options

    this.hooks = {
      'package:compileEvents': this.compile.bind(this)
    }
  }

  getFunctions() {
    return this.serverless.service.getAllFunctions()
  }

  // TODO: could we access SSM to get the service token
  getPolicyCloudFormation(
    policy: AlertPolicy,
    policyServiceToken: string,
    normalizedFunctionName: string
  ) {
    return {
      [`${getNormalizedPolicyName(normalizedFunctionName, policy.name)}`]: {
        Type: 'Custom::NewRelicPolicy',
        Properties: {
          ServiceToken: policyServiceToken,
          policy: {
            ...policy
          }
        }
      }
    }
  }

  getFilterItemCloudFormation(
    filterItem: FilterItem,
    filterItemServiceToken: string,
    normalizedFunctionName: string
  ) {
    return {
      [`${getNormalizedFilterItemName(normalizedFunctionName)}`]: {
        Type: 'Custom::NRFilterItem',
        Properties: {
          ServiceToken: filterItemServiceToken,
          data: {
            ...filterItem
          }
        }
      }
    }
  }

  getInfrastructureConditionCloudFormation(
    infrastructureCondition: InfrastructureCondition,
    infrastructureConditionServiceToken: string,
    normalizedFunctionName: string
  ) {
    const policy_id = infrastructureCondition.policy_id
    delete infrastructureCondition.policy_id
    return {
      [`${getNormalizedInfrastructureConditionName(
        normalizedFunctionName,
        infrastructureCondition.data.name
      )}`]: {
        Type: 'Custom::NewRelicInfrastructureCondition',
        Properties: {
          ServiceToken: infrastructureConditionServiceToken,
          policy_id: policy_id,
          ...infrastructureCondition
        }
      }
    }
  }

  getNrqlConditionCloudFormation(
    nrqlCondition: NrqlCondition,
    nrqlConditionServiceToken: string,
    normalizedFunctionName: string
  ) {
    const policy_id = nrqlCondition.policy_id
    delete nrqlCondition.policy_id
    return {
      [`${getNormalizedNrqlConditionName(normalizedFunctionName, nrqlCondition.name)}`]: {
        Type: 'Custom::NewRelicNrqlCondition',
        Properties: {
          ServiceToken: nrqlConditionServiceToken,
          policy_id: policy_id,
          nrql_condition: {
            ...nrqlCondition
          }
        }
      }
    }
  }

  compile() {
    const functions = this.getFunctions()
    if (!functions) {
      // TODO warn no config
      return
    }

    functions.forEach(functionName => {
      const functionObj = this.serverless.service.getFunction(
        functionName
      ) as Serverless.FunctionDefinition & { alerts: AlertsParams }
      const {
        alerts: {
          policies = [],
          filter_item = [],
          infrastructure_conditions = [],
          nrql_conditions = [],
          policy_service_token: policyServiceToken = '',
          filter_item_service_token: filterItemServiceToken = '',
          nrql_condition_service_token: nrqlConditionServiceToken = '',
          infrastructure_condition_service_token: infrastructureConditionServiceToken = ''
        } = {}
      } = functionObj

      const policyStatements = policies.reduce((statements, policy) => {
        if (policy) {
          const normalizedFunctionName = this.providerNaming.getLambdaLogicalId(functionName)
          const cf = this.getPolicyCloudFormation(
            policy,
            policyServiceToken,
            normalizedFunctionName
          )
          return { ...statements, ...cf }
        }
      }, {})

      const filterItemStatements = filter_item.reduce((statements, filterItem) => {
        if (filterItem) {
          const normalizedFunctionName = this.providerNaming.getLambdaLogicalId(functionName)
          const cf = this.getFilterItemCloudFormation(
            filterItem,
            filterItemServiceToken,
            normalizedFunctionName
          )
          return { ...statements, ...cf }
        }
      }, {})

      const infrastructureConditionStatements = infrastructure_conditions.reduce(
        (statements, condition) => {
          if (condition) {
            const normalizedFunctionName = this.providerNaming.getLambdaLogicalId(functionName)
            const cf = this.getInfrastructureConditionCloudFormation(
              condition,
              infrastructureConditionServiceToken,
              normalizedFunctionName
            )
            return { ...statements, ...cf }
          }
        },
        {}
      )

      const nrqlConditionStatements = nrql_conditions.reduce((statements, condition) => {
        if (condition) {
          const normalizedFunctionName = this.providerNaming.getLambdaLogicalId(functionName)
          const cf = this.getNrqlConditionCloudFormation(
            condition,
            nrqlConditionServiceToken,
            normalizedFunctionName
          )
          return { ...statements, ...cf }
        }
      }, {})

      console.log('FilterItem: ', filterItemStatements)

      Object.assign(this.serverless.service.provider.compiledCloudFormationTemplate.Resources, {
        ...policyStatements,
        ...filterItemStatements,
        ...infrastructureConditionStatements,
        ...nrqlConditionStatements
      })
    })
  }
}

module.exports = ServerlessPlugin
