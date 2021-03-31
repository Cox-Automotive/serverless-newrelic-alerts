import { upperFirst, camelCase } from 'lodash'

export const getNormalizedName = (name: string) => upperFirst(camelCase(name))

export function getNormalizedPolicyName(policyName: string) {
  return `${getNormalizedName(policyName)}NewRelicPolicy`
}

export const getNormalizedInfrastructureConditionName = (conditionName: string) => {
  return `${getNormalizedName(conditionName)}`
}
