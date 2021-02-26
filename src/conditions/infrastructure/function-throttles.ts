import { InfrastructureCondition } from '../../types/infrastructure-condition'
import { IntegrationProvider } from '../../constants/integration-provider'
import { ConditionType } from '../../constants/condition-type'
import { EventType } from '../../constants/event-type'
import { Comparison } from '../../constants/comparison'
import { TimeFunction } from '../../constants/time-function'
import getFunctionCustomInfrastructureCondition from './function-custom'

const getFunctionThrottlesInfrastructureCondition = (
  policyId: string,
  conditionName: string,
  functionNames: string[]
): InfrastructureCondition =>
  getFunctionCustomInfrastructureCondition(policyId, conditionName, functionNames, {
    selectValue: 'provider.throttles.Maximum',
    comparison: Comparison.ABOVE,
    criticalThreshold: {
      value: 3,
      duration_minutes: 5,
      time_function: TimeFunction.ALL
    }
  })

export default getFunctionThrottlesInfrastructureCondition
