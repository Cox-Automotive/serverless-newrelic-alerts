export function getNormalizedPolicyName(functionName: string, policyName: string) {
  return `${functionName}${policyName.split(' ').join('')}Policy`
}

export const getNormalizedFilterItemName = (functionName: string, filterItemName: string = '') => {
  return `${functionName}${filterItemName.split(' ').join('')}FilterItem`
}

export const getNormalizedInfrastructureConditionName = (
  functionName: string,
  conditionName: string
) => {
  return `${functionName}${conditionName.split(' ').join('')}InfrastructureCondition`
}

export const getNormalizedNrqlConditionName = (functionName: string, conditionName: string) => {
  return `${functionName}${conditionName.split(' ').join('')}NrqlCondition`
}
