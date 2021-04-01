import { isAlertOfType } from '../../src/utils/alert'
import { ApiGatewayAlert, FunctionAlert } from '../../src/constants/alerts'
import { AlertsSet } from '../../src/constants/alerts-set'

describe('Identify type of alert', () => {
  it('should work with function alert', () => {
    expect(isAlertOfType(FunctionAlert.DURATION_1_SEC, FunctionAlert)).toBe(true)
    expect(isAlertOfType(FunctionAlert.DURATION_1_SEC, AlertsSet)).toBe(false)
    expect(isAlertOfType(FunctionAlert.DURATION_1_SEC, ApiGatewayAlert)).toBe(false)
  })

  it('should work with api gateway alert', () => {
    expect(isAlertOfType(ApiGatewayAlert.ERRORS_4XX, ApiGatewayAlert)).toBe(true)
    expect(isAlertOfType(ApiGatewayAlert.ERRORS_4XX, AlertsSet)).toBe(false)
    expect(isAlertOfType(ApiGatewayAlert.ERRORS_4XX, FunctionAlert)).toBe(false)
  })

  it('should work with alert set', () => {
    expect(isAlertOfType(AlertsSet.DYNAMO_DB_SYSTEM_ERRORS, AlertsSet)).toBe(true)
    expect(isAlertOfType(AlertsSet.DYNAMO_DB_SYSTEM_ERRORS, ApiGatewayAlert)).toBe(false)
    expect(isAlertOfType(AlertsSet.DYNAMO_DB_SYSTEM_ERRORS, FunctionAlert)).toBe(false)
  })
})
