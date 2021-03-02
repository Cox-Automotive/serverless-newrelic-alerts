import { InfrastructureCondition } from '../../../types/infrastructure-condition'
import { ConditionType } from '../../../constants/condition-type'
import { EventType } from '../../../constants/event-type'
import { IntegrationProvider } from '../../../constants/integration-provider'
import { DynamoDbAlert } from '../../../constants/alerts'
import defaultAlerts from './default-alerts'

const getDynamoDbTableInfrastructureCondition = (
  alert: DynamoDbAlert,
  policyId: string,
  conditionName: string,
  tableNames: string[]
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
              tableNames: tableNames
            }
          }
        ]
      },
      violation_close_timer: 24,
      policy_id: { Ref: policyId },
      event_type: EventType.DATASTORE_SAMPLE,
      select_value: defaultConfig.selectValue,
      comparison: defaultConfig.comparison,
      critical_threshold: defaultConfig.criticalThreshold,
      integration_provider: IntegrationProvider.DYNAMO_DB_TABLE
    }
  }
}

export default getDynamoDbTableInfrastructureCondition
