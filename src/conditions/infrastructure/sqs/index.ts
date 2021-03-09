import { InfrastructureCondition } from '../../../types/infrastructure-condition'
import { ConditionType } from '../../../constants/condition-type'
import { EventType } from '../../../constants/event-type'
import { IntegrationProvider } from '../../../constants/integration-provider'
import { SqsAlert } from '../../../constants/alerts'
import defaultAlerts from './default-alerts'

const getSqsInfrastructureCondition = (
  alert: SqsAlert,
  policyId: string,
  conditionName: string,
  queuesNames: string[],
  violationCloseTimer?: number
): InfrastructureCondition => {
  const defaultConfig = defaultAlerts[alert]

  return {
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
      violation_close_timer: violationCloseTimer,
      policy_id: { Ref: policyId },
      event_type: EventType.QUEUE_SAMPLE,
      select_value: defaultConfig.selectValue,
      comparison: defaultConfig.comparison,
      critical_threshold: defaultConfig.criticalThreshold,
      integration_provider: IntegrationProvider.SQS_QUEUE
    }
  }
}

export default getSqsInfrastructureCondition
