import { ApiGatewayAlert, FunctionAlert, DlqAlert } from '../constants/alerts'

export type Alert = FunctionAlert | ApiGatewayAlert | DlqAlert

export type ResourceAlertOverride = {
  alerts: (Alert | { name: Alert; enabled: boolean })[]
}

export type NewrelicAlertsConfig = {
  policyServiceToken: string
  infrastructureConditionServiceToken: string
  alerts?: Alert[]
}
