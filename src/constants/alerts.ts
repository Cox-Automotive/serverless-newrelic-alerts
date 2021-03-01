export enum FunctionAlert {
  DURATION_1_SEC = 'functionDuration1Sec',
  ERRORS = 'functionErrors',
  THROTTLES = 'functionThrottles'
}

export enum ApiGatewayAlert {
  ERRORS_4XX = 'apiGateway4XXErrors',
  ERRORS_5XX = 'apiGateway5XXErrors'
}

export enum DlqAlert {
  VISIBLE_MESSAGES = 'dlqVisibleMessages'
}
