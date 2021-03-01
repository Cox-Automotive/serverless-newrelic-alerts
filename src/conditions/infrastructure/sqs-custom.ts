import { EventType } from '../../constants/event-type'
import { Comparison } from '../../constants/comparison'
import { CriticalThreshold } from '../../types/critical-threshold'
import { InfrastructureCondition } from '../../types/infrastructure-condition'
import { ConditionType } from '../../constants/condition-type'
import { IntegrationProvider } from '../../constants/integration-provider'

type SqsConditionOptions = {
  comparison: Comparison
  criticalThreshold: CriticalThreshold
  selectValue: string
}

const getSqsCustomInfrastructureCondition = (
  policyId: string,
  conditionName: string,
  queuesNames: string[],
  options: SqsConditionOptions
): InfrastructureCondition => ({
  policy_id: { Ref: policyId },
  data: {
    type: ConditionType.INFRA_METRIC,
    name: conditionName,
    enabled: true,
    filter: {
      and: [
        {
          in: {
            queueName: queuesNames
          }
        }
      ]
    },
    violation_close_timer: 24,
    policy_id: { Ref: policyId },
    event_type: EventType.QUEUE_SAMPLE,
    select_value: options.selectValue,
    comparison: options.comparison,
    critical_threshold: options.criticalThreshold,
    integration_provider: IntegrationProvider.SQS_QUEUE
  }
})

export default getSqsCustomInfrastructureCondition
