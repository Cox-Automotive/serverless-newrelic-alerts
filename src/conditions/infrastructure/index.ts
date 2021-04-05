import { defaultAlertTypes } from '../../constants/alerts'
import { ConditionType } from '../../constants/condition-type'
import defaultAlerts from './default-alerts'

const getInfrastructureCondition = (alert, serviceName, policyId) => {
  if (defaultAlertTypes.includes(alert.type)) {
    const defaultConfig = defaultAlerts[alert.type]
    return {
      policy_id: { Ref: policyId },
      data: {
        type: ConditionType.INFRA_METRIC,
        name: `${serviceName} - ${alert.title}`,
        enabled: alert.enabled,
        filter: {
          and: [
            {
              in: {
                [defaultConfig.filterTypeName]: alert.resources
              }
            }
          ]
        },
        policy_id: { Ref: policyId },
        violation_close_timer: alert.violationCloseTimer,
        comparison: alert.comparison || defaultConfig.comparison,
        select_value: alert.metric || defaultConfig.selectValue,
        critical_threshold: alert.criticalThreshold || defaultConfig.criticalThreshold,
        integration_provider: defaultConfig.integrationProvider,
        event_type: defaultConfig.eventType,
        runbook_url: alert.runbookURL
      }
    }
  } else {
    throw new Error('Unknown alert')
  }
}

export default getInfrastructureCondition
