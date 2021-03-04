# New Relic Serverless Plugin

[![NPM](https://nodei.co/npm/serverless-newrelic-alerts.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/serverless-newrelic-alerts/)

[![CircleCI](https://circleci.com/gh/Cox-Automotive/serverless-newrelic-alerts.svg?style=shield)](https://circleci.com/gh/Cox-Automotive/serverless-newrelic-alerts)

This serverless plugin allows adding New Relic alerts to a resources.
The sole responsibility of the plugin is to generate additional
CloudFormation code with [Custom Resources](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/template-custom-resources.html),
that will create New Relic alerts for the function.

**The plugin development plans include templates that can be used
with 1-2 lines of code in serverless.yml**

### Usage

```yml
plugins:
  - serverless-newrelic-alerts

custom:
  newrelicAlerts:
    policyServiceToken: arn:aws:test-policy_service_token
    infrastructureConditionServiceToken: arn:aws:test-infrastructure_condition_service_token
    violationCloseTimer: 24
    alerts:
      - functionDuration1Sec
      - functionErrors
      - apiGateway4XXErrors
      - apiGateway5XXErrors
      - sqsDlqVisibleMessages
      - dynamoDbSystemErrors
      - dynamoDbUserErrors

functions:
  under-newrelic-mntrng:
    handler: index.endpoint
    alerts:
      - name: functionErrors
        enabled: false
      - functionThrottles
```

Examples of generated CF:

- Policy
```json
{
  "PluginTestNewRelicPolicy": {
    "Type": "Custom::NewRelicPolicy",
    "Properties": {
      "ServiceToken": "arn:aws:test-policy_service_token",
      "policy": {
        "name": "PluginTest TEST",
        "incident_preference": "PER_POLICY"
      }
    }
  }
}
```

- Infrastructure condition
```json
{
  "FunctionThrottlesInfrastructureCondition": {
    "Type": "Custom::NewRelicInfrastructureCondition",
    "Properties": {
      "ServiceToken": "arn:aws:test-infrastructure_condition_service_token",
      "policy_id": {
        "Ref": "PluginTestNewRelicPolicy"
      },
      "data": {
        "type": "infra_metric",
        "name": "PluginTest TEST - Function Throttles",
        "enabled": true,
        "filter": "DEPENDS ON METRIC TYPE",
        "violation_close_timer": 24,
        "policy_id": {
          "Ref": "PluginTestNewRelicPolicy"
        },
        "event_type": "DEPENDS ON METRIC TYPE",
        "select_value": "DEPENDS ON METRIC TYPE",
        "comparison": "DEPENDS ON METRIC TYPE",
        "critical_threshold": {
          "value": "DEPENDS ON METRIC TYPE",
          "duration_minutes": "DEPENDS ON METRIC TYPE",
          "time_function": "DEPENDS ON METRIC TYPE",
        },
        "integration_provider": "DEPENDS ON METRIC TYPE",
      }
    }
  }
}
```

## Configuration

- `policyServiceToken` - arn of lambda managing policy (required)
- `infrastructureConditionServiceToken` - arn of lambda managing infrastructure conditions (required)
- `violationCloseTimer` - after what time alert conditions should be force-closed - 24h by default, pass `0` to turn off auto closing
- `alerts` - list of required alerts

## List of preconfigured metrics 

### Lambda

Alerts configured in custom section of `serverless.yml` will be applied to all functions in stack 
unless function disable it, alerts configured on function level will be applied 
only to chosen functions.

Filtering performed by `displayName`

```yml
functions:
  under-newrelic-mntrng:
    handler: index.endpoint
    alerts:
      - name: functionErrors
        enabled: false
      - functionThrottles
```

#### Metrics:

- functionDuration1Sec
```
"select_value": "provider.duration.Maximum",
"comparison": "above",
"critical_threshold": {
  "value": 1000,
  "duration_minutes": 5,
  "time_function": "all"
}
```
- functionErrors
```
"select_value": "provider.errors.Sum",
"comparison": "above",
"critical_threshold": {
  "value": 3,
  "duration_minutes": 5,
  "time_function": "all"
}
```
- functionThrottles
```
"select_value": "provider.throttles.Maximum",
"comparison": "above",
"critical_threshold": {
  "value": 3,
  "duration_minutes": 5,
  "time_function": "all"
}
```

### Api Gateway

Alerts configured in custom section of `serverless.yml` will be applied to all apiGateways in stack.

Filtering performed by `apiName`.

#### Metrics:

- apiGateway4XXErrors
```
"select_value": "provider.4xxError.Sum",
"comparison": "above",
"critical_threshold": {
  "value": 3,
  "duration_minutes": 5,
  "time_function": "all"
}
```
- apiGateway5XXErrors
```
"select_value": "provider.5xxError.Sum",
"comparison": "above",
"critical_threshold": {
  "value": 3,
  "duration_minutes": 5,
  "time_function": "all"
}
```

### SQS

Filtering performed by `queueName`.

#### DLQ Metrics:

Alerts configured in custom section of `serverless.yml` will be applied to all sqs with name ending with `-dlq` in stack.

- sqsDlqVisibleMessages
```
"select_value": "provider.approximateNumberOfMessagesVisible.Maximum",
"comparison": "above",
"critical_threshold": {
  "value": 3,
  "duration_minutes": 5,
  "time_function": "all"
}
```

### DynamoDb

Alerts configured in custom section of `serverless.yml` will be applied to all tables in stack.
Filtering performed by `tableName`.

#### Metric:

- dynamoDbBatchGetSystemErrors
```
"select_value": "provider.batchGetSystemErrors.Sum",
"comparison": "above",
"critical_threshold": {
  "value": 3,
  "duration_minutes": 5,
  "time_function": "all"
}
```
- dynamoDbBatchWriteSystemErrors
```
"select_value": "provider.batchWriteSystemErrors.Sum",
"comparison": "above",
"critical_threshold": {
  "value": 3,
  "duration_minutes": 5,
  "time_function": "all"
}
```
- dynamoDbDeleteSystemErrors
```
"select_value": "provider.deleteSystemErrors.Sum",
"comparison": "above",
"critical_threshold": {
  "value": 3,
  "duration_minutes": 5,
  "time_function": "all"
}
```
- dynamoDbGetSystemErrors
```
"select_value": "provider.getSystemErrors.Sum",
"comparison": "above",
"critical_threshold": {
  "value": 3,
  "duration_minutes": 5,
  "time_function": "all"
}
```
- dynamoDbPutSystemErrors
```
"select_value": "provider.putSystemErrors.Sum",
"comparison": "above",
"critical_threshold": {
  "value": 3,
  "duration_minutes": 5,
  "time_function": "all"
}
```
- dynamoDbQuerySystemErrors
```
"select_value": "provider.querySystemErrors.Sum",
"comparison": "above",
"critical_threshold": {
  "value": 3,
  "duration_minutes": 5,
  "time_function": "all"
}
```
- dynamoDbScanSystemErrors
```
"select_value": "provider.scanSystemErrors.Sum",
"comparison": "above",
"critical_threshold": {
  "value": 3,
  "duration_minutes": 5,
  "time_function": "all"
}
```
- dynamoDbUpdateSystemErrors
```
"select_value": "provider.updateSystemErrors.Sum",
"comparison": "above",
"critical_threshold": {
  "value": 3,
  "duration_minutes": 5,
  "time_function": "all"
}
```
- dynamoDbUserErrors
```
"select_value": "provider.userErrors.Sum",
"comparison": "above",
"critical_threshold": {
  "value": 3,
  "duration_minutes": 5,
  "time_function": "all"
}
```
- dynamoDbSystemErrors - alias for batch of system errors metrics:
```
dynamoDbBatchGetSystemErrors
dynamoDbBatchWriteSystemErrors
dynamoDbDeleteSystemErrors
dynamoDbGetSystemErrors
dynamoDbPutSystemErrors
dynamoDbQuerySystemErrors
dynamoDbScanSystemErrors
dynamoDbUpdateSystemErrors
```
