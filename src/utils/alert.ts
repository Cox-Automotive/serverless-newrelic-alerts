import { AlertType } from '../types/alert'
import { AlertsSet } from '../constants/alerts-set'
import { defaultAlertTypes } from '../constants/alerts'
import { startCase, isString } from 'lodash'

export const isAlertOfType = <T extends AlertType | AlertsSet>(
  alert: AlertType | AlertsSet,
  group: {
    [key: string]: T
  }
): alert is T => {
  return Object.values<AlertType | AlertsSet>(group).includes(alert)
}

export const isValidType = alertType => {
  return defaultAlertTypes.includes(alertType) || isAlertOfType(alertType, AlertsSet)
}

export const getAlertTitle = (serviceName, alertConfig, alertDescription) => {
  const alertTitle =
    !isString(alertConfig) && alertConfig.title ? alertConfig.title : startCase(alertDescription)

  return `${serviceName} - ${alertTitle}`
}
