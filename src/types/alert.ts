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
