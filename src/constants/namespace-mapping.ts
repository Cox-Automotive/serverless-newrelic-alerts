import { ApiGatewayAlert, DynamoDbAlert, SqsAlert } from './alerts'
import { EventType } from './event-type'
import { IntegrationProvider } from './integration-provider'

export const namespaceMapping = {
  'AWS::Lambda::Function': {
    propertyName: 'FunctionName',
    filterTypeName: 'displayName',
    integrationType: IntegrationProvider.LAMBDA_FUNCTION,
    eventType: EventType.SERVERLESS_SAMPLE
  },
  'AWS::ApiGateway::RestApi': {
    propertyName: 'Name',
    alertType: ApiGatewayAlert,
    filterTypeName: 'apiName',
    eventType: EventType.API_GATEWAY_SAMPLE
  },
  'AWS::SQS::Queue': {
    propertyName: 'QueueName',
    filterTypeName: 'queueName',
    integrationType: IntegrationProvider.SQS_QUEUE,
    eventType: EventType.QUEUE_SAMPLE,
    alertType: SqsAlert
  },
  'AWS::DynamoDB::Table': {
    propertyName: 'TableName',
    filterTypeName: 'table',
    alertType: DynamoDbAlert,
    integrationType: IntegrationProvider.DYNAMO_DB_TABLE,
    eventType: EventType.DATASTORE_SAMPLE
  }
}
