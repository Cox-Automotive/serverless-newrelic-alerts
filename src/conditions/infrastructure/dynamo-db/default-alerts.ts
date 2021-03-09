import { ApiGatewayAlert, DynamoDbAlert } from '../../../constants/alerts'
import { Comparison } from '../../../constants/comparison'
import { TimeFunction } from '../../../constants/time-function'

const DEFAULT_DURATION = 5
const DEFAULT_CRITICAL_VALUE = 3

const defaultAlerts = {
  [DynamoDbAlert.BATCH_GET_SYSTEM_ERRORS]: {
    selectValue: 'provider.batchGetSystemErrors.Sum',
    comparison: Comparison.ABOVE,
    criticalThreshold: {
      value: DEFAULT_CRITICAL_VALUE,
      duration_minutes: DEFAULT_DURATION,
      time_function: TimeFunction.ALL
    }
  },
  [DynamoDbAlert.BATCH_WRITE_SYSTEM_ERRORS]: {
    selectValue: 'provider.batchWriteSystemErrors.Sum',
    comparison: Comparison.ABOVE,
    criticalThreshold: {
      value: DEFAULT_CRITICAL_VALUE,
      duration_minutes: DEFAULT_DURATION,
      time_function: TimeFunction.ALL
    }
  },
  [DynamoDbAlert.DELETE_SYSTEM_ERRORS]: {
    selectValue: 'provider.deleteSystemErrors.Sum',
    comparison: Comparison.ABOVE,
    criticalThreshold: {
      value: DEFAULT_CRITICAL_VALUE,
      duration_minutes: DEFAULT_DURATION,
      time_function: TimeFunction.ALL
    }
  },
  [DynamoDbAlert.GET_SYSTEM_ERRORS]: {
    selectValue: 'provider.getSystemErrors.Sum',
    comparison: Comparison.ABOVE,
    criticalThreshold: {
      value: DEFAULT_CRITICAL_VALUE,
      duration_minutes: DEFAULT_DURATION,
      time_function: TimeFunction.ALL
    }
  },
  [DynamoDbAlert.PUT_SYSTEM_ERRORS]: {
    selectValue: 'provider.putSystemErrors.Sum',
    comparison: Comparison.ABOVE,
    criticalThreshold: {
      value: DEFAULT_CRITICAL_VALUE,
      duration_minutes: DEFAULT_DURATION,
      time_function: TimeFunction.ALL
    }
  },
  [DynamoDbAlert.QUERY_SYSTEM_ERRORS]: {
    selectValue: 'provider.querySystemErrors.Sum',
    comparison: Comparison.ABOVE,
    criticalThreshold: {
      value: DEFAULT_CRITICAL_VALUE,
      duration_minutes: DEFAULT_DURATION,
      time_function: TimeFunction.ALL
    }
  },
  [DynamoDbAlert.SCAN_SYSTEM_ERRORS]: {
    selectValue: 'provider.scanSystemErrors.Sum',
    comparison: Comparison.ABOVE,
    criticalThreshold: {
      value: DEFAULT_CRITICAL_VALUE,
      duration_minutes: DEFAULT_DURATION,
      time_function: TimeFunction.ALL
    }
  },
  [DynamoDbAlert.UPDATE_SYSTEM_ERRORS]: {
    selectValue: 'provider.updateSystemErrors.Sum',
    comparison: Comparison.ABOVE,
    criticalThreshold: {
      value: DEFAULT_CRITICAL_VALUE,
      duration_minutes: DEFAULT_DURATION,
      time_function: TimeFunction.ALL
    }
  },
  [DynamoDbAlert.USER_ERRORS]: {
    selectValue: 'provider.userErrors.Sum',
    comparison: Comparison.ABOVE,
    criticalThreshold: {
      value: DEFAULT_CRITICAL_VALUE,
      duration_minutes: DEFAULT_DURATION,
      time_function: TimeFunction.ALL
    }
  }
}

export default defaultAlerts
