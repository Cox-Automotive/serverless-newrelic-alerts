import { ApiGatewayAlert } from '../../../constants/alerts'
import { Comparison } from '../../../constants/comparison'
import { namespaceMapping } from '../../../constants/namespace-mapping'
import { TimeFunction } from '../../../constants/time-function'

const defaultAPIGwAlerts = {
  [ApiGatewayAlert.ERRORS_4XX]: {
    ...namespaceMapping['AWS::ApiGateway::RestApi'],
    selectValue: 'provider.4xxError.Sum',
    comparison: Comparison.ABOVE,
    criticalThreshold: {
      value: 3,
      duration_minutes: 5,
      time_function: TimeFunction.ALL
    }
  },
  [ApiGatewayAlert.ERRORS_5XX]: {
    ...namespaceMapping['AWS::ApiGateway::RestApi'],
    selectValue: 'provider.5xxError.Sum',
    comparison: Comparison.ABOVE,
    criticalThreshold: {
      value: 3,
      duration_minutes: 5,
      time_function: TimeFunction.ALL
    }
  }
}

export default defaultAPIGwAlerts
