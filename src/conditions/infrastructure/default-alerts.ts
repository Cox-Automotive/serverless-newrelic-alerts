import defaultAPIGwAlerts from './api-gateway/default-alerts'
import defaultDynamoDBAlerts from './dynamo-db/default-alerts'
import defaultFunctionAlerts from './function/default-alerts'
import defaultSQSAlerts from './sqs/default-alerts'

const defaultAlerts = {
  ...defaultAPIGwAlerts,
  ...defaultDynamoDBAlerts,
  ...defaultFunctionAlerts,
  ...defaultSQSAlerts
}

export default defaultAlerts
