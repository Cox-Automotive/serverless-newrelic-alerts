import { SqsAlert } from '../../../constants/alerts'
import { Comparison } from '../../../constants/comparison'
import { namespaceMapping } from '../../../constants/namespace-mapping'
import { TimeFunction } from '../../../constants/time-function'

const defaultSQSAlerts = {
  [SqsAlert.DLQ_VISIBLE_MESSAGES]: {
    ...namespaceMapping['AWS::SQS::Queue'],
    selectValue: 'provider.approximateNumberOfMessagesVisible.Maximum',
    comparison: Comparison.ABOVE,
    criticalThreshold: {
      value: 3,
      duration_minutes: 5,
      time_function: TimeFunction.ALL
    }
  }
}

export default defaultSQSAlerts
