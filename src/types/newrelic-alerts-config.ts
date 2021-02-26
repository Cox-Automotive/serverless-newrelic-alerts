import { FunctionAlert } from '../constants/alerts'

export type Alert = FunctionAlert

export type NewrelicAlertsConfig = {
  policyServiceToken: string
  infrastructureConditionServiceToken: string
  alerts?: Alert[]
}
