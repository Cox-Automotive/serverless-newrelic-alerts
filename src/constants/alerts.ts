export enum FunctionAlert {
  DURATION_1_SEC = 'functionDuration1Sec',
  ERRORS = 'functionErrors',
  THROTTLES = 'functionThrottles'
}

export enum ApiGatewayAlert {
  ERRORS_4XX = 'apiGateway4XXErrors',
  ERRORS_5XX = 'apiGateway5XXErrors'
}

export enum SqsAlert {
  DLQ_VISIBLE_MESSAGES = 'sqsDlqVisibleMessages'
}

export enum DynamoDbAlert {
  BATCH_GET_SYSTEM_ERRORS = 'dynamoDbBatchGetSystemErrors',
  BATCH_WRITE_SYSTEM_ERRORS = 'dynamoDbBatchWriteSystemErrors',
  DELETE_SYSTEM_ERRORS = 'dynamoDbDeleteSystemErrors',
  GET_SYSTEM_ERRORS = 'dynamoDbGetSystemErrors',
  PUT_SYSTEM_ERRORS = 'dynamoDbPutSystemErrors',
  QUERY_SYSTEM_ERRORS = 'dynamoDbQuerySystemErrors',
  SCAN_SYSTEM_ERRORS = 'dynamoDbScanSystemErrors',
  UPDATE_SYSTEM_ERRORS = 'dynamoDbUpdateSystemErrors',
  USER_ERRORS = 'dynamoDbUserErrors'
}
