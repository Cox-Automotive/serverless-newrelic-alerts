import { InfrastructureCondition } from '../../types/infrastructure-condition'
import getApiGatewayCustomInfrastructureCondition from './api-gateway-custom'
import { Comparison } from '../../constants/comparison'
import { TimeFunction } from '../../constants/time-function'

const getApiGateway5xxErrorsInfrastructureCondition = (
  policyId: string,
  conditionName: string,
  apisNames: string[]
): InfrastructureCondition =>
  getApiGatewayCustomInfrastructureCondition(policyId, conditionName, apisNames, {
    selectValue: 'provider.5xxError.Sum',
    comparison: Comparison.ABOVE,
    criticalThreshold: {
      value: 3,
      duration_minutes: 5,
      time_function: TimeFunction.ALL
    }
  })

export default getApiGateway5xxErrorsInfrastructureCondition
