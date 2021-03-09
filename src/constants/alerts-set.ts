import { DynamoDbAlert } from './alerts'

export enum AlertsSet {
  DYNAMO_DB_SYSTEM_ERRORS = 'dynamoDbSystemErrors'
}

export const AlertsSetMapping = {
  [AlertsSet.DYNAMO_DB_SYSTEM_ERRORS]: [
    DynamoDbAlert.BATCH_GET_SYSTEM_ERRORS,
    DynamoDbAlert.BATCH_WRITE_SYSTEM_ERRORS,
    DynamoDbAlert.DELETE_SYSTEM_ERRORS,
    DynamoDbAlert.GET_SYSTEM_ERRORS,
    DynamoDbAlert.PUT_SYSTEM_ERRORS,
    DynamoDbAlert.QUERY_SYSTEM_ERRORS,
    DynamoDbAlert.SCAN_SYSTEM_ERRORS,
    DynamoDbAlert.UPDATE_SYSTEM_ERRORS
  ]
}
