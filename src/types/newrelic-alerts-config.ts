import { FunctionAlert } from '../constants/alerts'

export type Alert = FunctionAlert

export type ResourceAlertOverride = {
  alerts: (Alert | { name: Alert; enabled: boolean })[]
}

export type NewrelicAlertsConfig = {
  policyServiceToken: string
  infrastructureConditionServiceToken: string
  alerts?: Alert[]
}
