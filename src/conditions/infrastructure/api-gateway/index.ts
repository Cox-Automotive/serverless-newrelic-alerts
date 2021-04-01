import { InfrastructureCondition } from '../../../types/infrastructure-condition'
import { ConditionType } from '../../../constants/condition-type'
import { EventType } from '../../../constants/event-type'
import { ApiGatewayAlert } from '../../../constants/alerts'
import defaultAlerts from './default-alerts'

const getApiGatewayInfrastructureCondition = (
  alert: ApiGatewayAlert,
  policyId: string,
  conditionName: string,
  apisNames: string[],
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
              apiName: apisNames
            }
          }
        ]
      },
      violation_close_timer: violationCloseTimer,
      policy_id: { Ref: policyId },
      event_type: EventType.API_GATEWAY_SAMPLE,
      select_value: defaultConfig.selectValue,
      comparison: defaultConfig.comparison,
      critical_threshold: defaultConfig.criticalThreshold
    }
  }
}

export default getApiGatewayInfrastructureCondition
