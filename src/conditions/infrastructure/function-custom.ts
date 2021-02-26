import { InfrastructureCondition } from '../../types/infrastructure-condition'
import { ConditionType } from '../../constants/condition-type'
import { EventType } from '../../constants/event-type'
import { Comparison } from '../../constants/comparison'
import { TimeFunction } from '../../constants/time-function'
import { IntegrationProvider } from '../../constants/integration-provider'
import { CriticalThreshold } from '../../types/critical-threshold'

type FunctionConditionOptions = {
  comparison: Comparison
  criticalThreshold: CriticalThreshold
  selectValue: string
}

const getFunctionCustomInfrastructureCondition = (
  policyId: string,
  conditionName: string,
  functionNames: string[],
  options: FunctionConditionOptions
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
            displayName: functionNames
          }
        }
      ]
    },
    violation_close_timer: 24,
    policy_id: { Ref: policyId },
    event_type: EventType.SERVERLESS_SAMPLE,
    select_value: options.selectValue,
    comparison: options.comparison,
    critical_threshold: options.criticalThreshold,
    integration_provider: IntegrationProvider.LAMBDA_FUNCTION
  }
})

export default getFunctionCustomInfrastructureCondition
