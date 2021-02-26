import { Alert } from '../../types/newrelic-alerts-config'
import { FunctionAlert } from '../../constants/alerts'
import getFunctionDurationInfrastructureCondition from './function-duration'
import getFunctionErrorsInfrastructureCondition from './function-errors'
import getFunctionThrottlesInfrastructureCondition from './function-throttles'

const getInfrastructureCondition = (
  conditionAlert: Alert,
  policyId: string,
  conditionName: string,
  functionNames: string[]
) => {
  switch (conditionAlert) {
    case FunctionAlert.DURATION_1_SEC:
      return getFunctionDurationInfrastructureCondition(
        policyId,
        conditionName,
        functionNames,
        1000
      )
    case FunctionAlert.ERRORS:
      return getFunctionErrorsInfrastructureCondition(policyId, conditionName, functionNames)
    case FunctionAlert.THROTTLES:
      return getFunctionThrottlesInfrastructureCondition(policyId, conditionName, functionNames)
    default:
      throw new Error('Unknown alert')
  }
}

export default getInfrastructureCondition
