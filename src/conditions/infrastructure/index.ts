import { Alert } from '../../types/newrelic-alerts-config'
import { ApiGatewayAlert, DynamoDbAlert, FunctionAlert, SqsAlert } from '../../constants/alerts'
import getFunctionInfrastructureCondition from './function'
import getApiGatewayInfrastructureCondition from './api-gateway'
import isAlertOfType from '../../utils/is-alert-of-type'
import getSqsInfrastructureCondition from './sqs'
import getDynamoDbTableInfrastructureCondition from './dynamo-db'

const getInfrastructureCondition = (
  conditionAlert: Alert,
  policyId: string,
  conditionName: string,
  resourceNames: string[]
) => {
  if (isAlertOfType(conditionAlert, FunctionAlert)) {
    return getFunctionInfrastructureCondition(
      conditionAlert,
      policyId,
      conditionName,
      resourceNames
    )
  } else if (isAlertOfType(conditionAlert, ApiGatewayAlert)) {
    return getApiGatewayInfrastructureCondition(
      conditionAlert,
      policyId,
      conditionName,
      resourceNames
    )
  } else if (isAlertOfType(conditionAlert, SqsAlert)) {
    return getSqsInfrastructureCondition(conditionAlert, policyId, conditionName, resourceNames)
  } else if (isAlertOfType(conditionAlert, DynamoDbAlert)) {
    return getDynamoDbTableInfrastructureCondition(
      conditionAlert,
      policyId,
      conditionName,
      resourceNames
    )
  } else {
    throw new Error('Unknown alert')
  }
}

export default getInfrastructureCondition
