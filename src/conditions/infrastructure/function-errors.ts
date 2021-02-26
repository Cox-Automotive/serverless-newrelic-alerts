import { InfrastructureCondition } from '../../types/infrastructure-condition'
import { TimeFunction } from '../../constants/time-function'
import { Comparison } from '../../constants/comparison'
import { IntegrationProvider } from '../../constants/integration-provider'
import { EventType } from '../../constants/event-type'
import { ConditionType } from '../../constants/condition-type'
import getFunctionCustomInfrastructureCondition from './function-custom'

const getFunctionErrorsInfrastructureCondition = (
  policyId: string,
  conditionName: string,
  functionNames: string[]
): InfrastructureCondition =>
  getFunctionCustomInfrastructureCondition(policyId, conditionName, functionNames, {
    selectValue: 'provider.errors.Sum',
    comparison: Comparison.ABOVE,
    criticalThreshold: {
      value: 3,
      duration_minutes: 5,
      time_function: TimeFunction.ALL
    }
  })

export default getFunctionErrorsInfrastructureCondition
