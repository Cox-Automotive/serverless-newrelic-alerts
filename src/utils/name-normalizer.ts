import upperFirst from 'lodash/upperFirst'
import camelCase from 'lodash/camelCase'

export const getNormalizedName = (name: string) => upperFirst(camelCase(name))

export function getNormalizedPolicyName(policyName: string) {
  return `${getNormalizedName(policyName)}NewRelicPolicy`
}

export const getNormalizedFilterItemName = (functionName: string, filterItemName: string = '') => {
  return `${functionName}${filterItemName.split(' ').join('')}FilterItem`
}

export const getNormalizedInfrastructureConditionName = (conditionName: string) => {
  return `${getNormalizedName(conditionName)}InfrastructureCondition`
}

export const getNormalizedNrqlConditionName = (functionName: string, conditionName: string) => {
  return `${functionName}${conditionName.split(' ').join('')}NrqlCondition`
}
