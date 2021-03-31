import { ApiGatewayAlert, FunctionAlert, SqsAlert, DynamoDbAlert } from '../constants/alerts'
import { Comparison } from '../constants/comparison'
import { Threshold } from './threshold'

export type AlertType = FunctionAlert | ApiGatewayAlert | SqsAlert | DynamoDbAlert

export type Alert = {
  type: AlertType
  enabled: boolean
  title: string
  resources: string[]
  runbookURL?: string
  namespace?: string
  metric?: string
  criticalThreshold?: Threshold
  comparison?: Comparison
  violationCloseTimer?: number
  filter?: string
}

export type ResourceAlertOverride = {
  alerts: (AlertType | Alert)[]
}
