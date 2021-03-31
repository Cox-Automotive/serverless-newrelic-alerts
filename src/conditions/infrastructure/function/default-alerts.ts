import { FunctionAlert } from '../../../constants/alerts'
import { Comparison } from '../../../constants/comparison'
import { namespaceMapping } from '../../../constants/namespace-mapping'
import { TimeFunction } from '../../../constants/time-function'

const defaultFunctionAlerts = {
  [FunctionAlert.ERRORS]: {
    ...namespaceMapping['AWS::Lambda::Function'],
    selectValue: 'provider.errors.Sum',
    comparison: Comparison.ABOVE,
    criticalThreshold: {
      value: 3,
      duration_minutes: 5,
      time_function: TimeFunction.ALL
    }
  },
  [FunctionAlert.THROTTLES]: {
    ...namespaceMapping['AWS::Lambda::Function'],
    selectValue: 'provider.throttles.Maximum',
    comparison: Comparison.ABOVE,
    criticalThreshold: {
      value: 3,
      duration_minutes: 5,
      time_function: TimeFunction.ALL
    }
  },
  [FunctionAlert.DURATION_1_SEC]: {
    ...namespaceMapping['AWS::Lambda::Function'],
    selectValue: 'provider.duration.Maximum',
    comparison: Comparison.ABOVE,
    criticalThreshold: {
      value: 1000,
      duration_minutes: 5,
      time_function: TimeFunction.ALL
    }
  }
}

export default defaultFunctionAlerts
