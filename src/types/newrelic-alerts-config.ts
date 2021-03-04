import { ApiGatewayAlert, FunctionAlert, SqsAlert, DynamoDbAlert } from '../constants/alerts'
import { AlertsSet } from '../constants/alerts-set'

export type Alert = FunctionAlert | ApiGatewayAlert | SqsAlert | DynamoDbAlert

export type ResourceAlertOverride = {
  alerts: (Alert | { name: Alert; enabled: boolean })[]
}

export type NewrelicAlertsConfig = {
  policyServiceToken: string
  infrastructureConditionServiceToken: string
  violationCloseTimer?: number
  alerts?: (Alert | AlertsSet)[]
}
