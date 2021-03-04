import { InfrastructureCondition } from '../../../types/infrastructure-condition'
import { ConditionType } from '../../../constants/condition-type'
import { EventType } from '../../../constants/event-type'
import { IntegrationProvider } from '../../../constants/integration-provider'
import { FunctionAlert } from '../../../constants/alerts'
import defaultAlerts from './default-alerts'

const getFunctionInfrastructureCondition = (
  alert: FunctionAlert,
  policyId: string,
  conditionName: string,
  functionNames: string[],
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
              displayName: functionNames
            }
          }
        ]
      },
      violation_close_timer: violationCloseTimer,
      policy_id: { Ref: policyId },
      event_type: EventType.SERVERLESS_SAMPLE,
      select_value: defaultConfig.selectValue,
      comparison: defaultConfig.comparison,
      critical_threshold: defaultConfig.criticalThreshold,
      integration_provider: IntegrationProvider.LAMBDA_FUNCTION
    }
  }
}

export default getFunctionInfrastructureCondition
