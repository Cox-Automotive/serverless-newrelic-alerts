import { FunctionAlert } from '../../../constants/alerts'
import { Comparison } from '../../../constants/comparison'
import { TimeFunction } from '../../../constants/time-function'

const defaultAlerts = {
  [FunctionAlert.ERRORS]: {
    selectValue: 'provider.errors.Sum',
    comparison: Comparison.ABOVE,
    criticalThreshold: {
      value: 3,
      duration_minutes: 5,
      time_function: TimeFunction.ALL
    }
  },
  [FunctionAlert.THROTTLES]: {
    selectValue: 'provider.throttles.Maximum',
    comparison: Comparison.ABOVE,
    criticalThreshold: {
      value: 3,
      duration_minutes: 5,
      time_function: TimeFunction.ALL
    }
  },
  [FunctionAlert.DURATION_1_SEC]: {
    selectValue: 'provider.duration.Maximum',
    comparison: Comparison.ABOVE,
    criticalThreshold: {
      value: 1000,
      duration_minutes: 5,
      time_function: TimeFunction.ALL
    }
  }
}

export default defaultAlerts
