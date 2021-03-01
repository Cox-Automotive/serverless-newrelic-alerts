import { InfrastructureCondition } from '../../types/infrastructure-condition'
import { Comparison } from '../../constants/comparison'
import { TimeFunction } from '../../constants/time-function'
import getSqsCustomInfrastructureCondition from './sqs-custom'

const getSqsVisibleMessagesInfrastructureCondition = (
  policyId: string,
  conditionName: string,
  queuesNames: string[]
): InfrastructureCondition =>
  getSqsCustomInfrastructureCondition(policyId, conditionName, queuesNames, {
    selectValue: 'provider.approximateNumberOfMessagesVisible.Maximum',
    comparison: Comparison.ABOVE,
    criticalThreshold: {
      value: 3,
      duration_minutes: 5,
      time_function: TimeFunction.ALL
    }
  })

export default getSqsVisibleMessagesInfrastructureCondition
