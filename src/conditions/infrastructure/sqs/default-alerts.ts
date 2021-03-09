import { FunctionAlert, SqsAlert } from '../../../constants/alerts'
import { Comparison } from '../../../constants/comparison'
import { TimeFunction } from '../../../constants/time-function'

const defaultAlerts = {
  [SqsAlert.DLQ_VISIBLE_MESSAGES]: {
    selectValue: 'provider.approximateNumberOfMessagesVisible.Maximum',
    comparison: Comparison.ABOVE,
    criticalThreshold: {
      value: 3,
      duration_minutes: 5,
      time_function: TimeFunction.ALL
    }
  }
}

export default defaultAlerts
