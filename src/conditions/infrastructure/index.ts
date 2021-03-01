import { Alert } from '../../types/newrelic-alerts-config'
import { ApiGatewayAlert, FunctionAlert } from '../../constants/alerts'
import getFunctionDurationInfrastructureCondition from './function-duration'
import getFunctionErrorsInfrastructureCondition from './function-errors'
import getFunctionThrottlesInfrastructureCondition from './function-throttles'
import getApiGateway4xxErrorsInfrastructureCondition from './api-gateway-4xx-errors'

const getInfrastructureCondition = (
  conditionAlert: Alert,
  policyId: string,
  conditionName: string,
  resourceNames: string[]
) => {
  switch (conditionAlert) {
    case FunctionAlert.DURATION_1_SEC:
      return getFunctionDurationInfrastructureCondition(
        policyId,
        conditionName,
        resourceNames,
        1000
      )
    case FunctionAlert.ERRORS:
      return getFunctionErrorsInfrastructureCondition(policyId, conditionName, resourceNames)
    case FunctionAlert.THROTTLES:
      return getFunctionThrottlesInfrastructureCondition(policyId, conditionName, resourceNames)
    case ApiGatewayAlert.ERRORS_4XX:
      return getApiGateway4xxErrorsInfrastructureCondition(policyId, conditionName, resourceNames)
    case ApiGatewayAlert.ERRORS_5XX:
      return getApiGateway4xxErrorsInfrastructureCondition(policyId, conditionName, resourceNames)
    default:
      throw new Error('Unknown alert')
  }
}

export default getInfrastructureCondition
