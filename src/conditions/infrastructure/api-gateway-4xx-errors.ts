import { InfrastructureCondition } from '../../types/infrastructure-condition'
import getFunctionCustomInfrastructureCondition from './function-custom'
import { Comparison } from '../../constants/comparison'
import { TimeFunction } from '../../constants/time-function'
import getApiGatewayCustomInfrastructureCondition from './api-gateway-custom'

const getApiGateway4xxErrorsInfrastructureCondition = (
  policyId: string,
  conditionName: string,
  apisNames: string[]
): InfrastructureCondition =>
  getApiGatewayCustomInfrastructureCondition(policyId, conditionName, apisNames, {
    selectValue: 'provider.4xxError.Sum',
    comparison: Comparison.ABOVE,
    criticalThreshold: {
      value: 3,
      duration_minutes: 5,
      time_function: TimeFunction.ALL
    }
  })

export default getApiGateway4xxErrorsInfrastructureCondition
