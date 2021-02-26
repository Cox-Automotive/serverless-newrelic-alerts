import { ConditionType } from '../constants/condition-type'
import { IntegrationProvider } from '../constants/integration-provider'
import { TimeFunction } from '../constants/time-function'
import { Comparison } from '../constants/comparison'
import { EventType } from '../constants/event-type'
import { Ref } from './ref'

export type InfrastructureCondition = {
  policy_id?: Ref
  data: {
    type: ConditionType
    name: string
    enabled: boolean
    filter: {
      and: {
        in: {
          displayName: string[]
        }
      }[]
    }
    violation_close_timer: number
    created_at_epoch_millis?: number
    updated_at_epoch_millis?: number
    policy_id: Ref
    event_type: EventType
    select_value: string
    comparison: Comparison
    critical_threshold: {
      value: number
      duration_minutes: number
      time_function: TimeFunction
    }
    integration_provider: IntegrationProvider
  }
}