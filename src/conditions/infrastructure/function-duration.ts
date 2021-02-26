import { InfrastructureCondition } from '../../types/infrastructure-condition'
import { ConditionType } from '../../constants/condition-type'
import { EventType } from '../../constants/event-type'
import { Comparison } from '../../constants/comparison'
import { TimeFunction } from '../../constants/time-function'
import { IntegrationProvider } from '../../constants/integration-provider'
import getFunctionCustomInfrastructureCondition from './function-custom'

const getFunctionDurationInfrastructureCondition = (
  policyId: string,
  conditionName: string,
  functionNames: string[],
  duration: number
): InfrastructureCondition =>
  getFunctionCustomInfrastructureCondition(policyId, conditionName, functionNames, {
    selectValue: 'provider.duration.Maximum',
    comparison: Comparison.ABOVE,
    criticalThreshold: {
      value: duration,
      duration_minutes: 5,
      time_function: TimeFunction.ALL
    }
  })

export default getFunctionDurationInfrastructureCondition
