import { ApiGatewayAlert } from '../../../constants/alerts'
import { Comparison } from '../../../constants/comparison'
import { TimeFunction } from '../../../constants/time-function'

const defaultAlerts = {
  [ApiGatewayAlert.ERRORS_4XX]: {
    selectValue: 'provider.4xxError.Sum',
    comparison: Comparison.ABOVE,
    criticalThreshold: {
      value: 3,
      duration_minutes: 5,
      time_function: TimeFunction.ALL
    }
  },
  [ApiGatewayAlert.ERRORS_5XX]: {
    selectValue: 'provider.5xxError.Sum',
    comparison: Comparison.ABOVE,
    criticalThreshold: {
      value: 3,
      duration_minutes: 5,
      time_function: TimeFunction.ALL
    }
  }
}

export default defaultAlerts
