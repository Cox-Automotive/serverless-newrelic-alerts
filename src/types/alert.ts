export type AlertsParams = {
  policy_service_token: string
  filter_item_service_token: string
  nrql_condition_service_token: string
  infrastructure_condition_service_token: string
  policies: AlertPolicy[]
  filter_item: FilterItem[]
  infrastructure_conditions: InfrastructureCondition[]
  nrql_conditions: NrqlCondition[]
}

export type AlertPolicy = {
  name: string
  incident_preference: string
}

export type InfrastructureCondition = {
  policy_id?: string
  data: {
    type: string
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
    created_at_epoch_millis: number
    updated_at_epoch_millis: number
    policy_id: number
    event_type: string
    select_value: string
    comparison: string
    critical_threshold: {
      value: number
      duration_minutes: number
      time_function: string
    }
    integration_provider: string
  }
}

export type FilterItem = {
  condition_id: string
  filter: {
    and: {
      in: {
        displayName: string
      }
    }
  }
}

export type NrqlCondition = {
  name: string
  policy_id?: string
  enabled: boolean
  terms: {
    duration: string
    operator: string
    priority: string
    threshold: string
    time_function: string
  }[]
  nrql: {
    query: string
    since_value: string
  }
}
