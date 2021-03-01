import { Comparison } from '../../constants/comparison'
import { CriticalThreshold } from '../../types/critical-threshold'
import { InfrastructureCondition } from '../../types/infrastructure-condition'
import { ConditionType } from '../../constants/condition-type'
import { EventType } from '../../constants/event-type'

type ApiGatewayConditionOptions = {
  comparison: Comparison
  criticalThreshold: CriticalThreshold
  selectValue: string
}

const getApiGatewayCustomInfrastructureCondition = (
  policyId: string,
  conditionName: string,
  apisNames: string[],
  options: ApiGatewayConditionOptions
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
            apiName: apisNames
          }
        }
      ]
    },
    violation_close_timer: 24,
    policy_id: { Ref: policyId },
    event_type: EventType.API_GATEWAY_SAMPLE,
    select_value: options.selectValue,
    comparison: options.comparison,
    critical_threshold: options.criticalThreshold
  }
})

export default getApiGatewayCustomInfrastructureCondition
