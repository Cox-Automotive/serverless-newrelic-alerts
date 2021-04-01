import { Alert } from '../types/newrelic-alerts-config'
import { AlertsSet } from '../constants/alerts-set'

const isAlertOfType = <T extends Alert | AlertsSet>(
  alert: Alert | AlertsSet,
  group: {
    [key: string]: T
  }
): alert is T => {
  return Object.values<Alert | AlertsSet>(group).includes(alert)
}

export default isAlertOfType
