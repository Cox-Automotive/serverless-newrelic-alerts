# New Relic Serverless Plugin

[![NPM](https://nodei.co/npm/serverless-newrelic-alerts.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/serverless-newrelic-alerts/)

[![CircleCI](https://circleci.com/gh/Cox-Automotive/serverless-newrelic-alerts.svg?style=shield)](https://circleci.com/gh/Cox-Automotive/serverless-newrelic-alerts)



This serverless plugin allows adding New Relic alerts to a function.
The sole responsibility of the plugin is to generate additional
CloudFormation code with [Custom Resources](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/template-custom-resources.html),
that will create New Relic alerts for the function.

**The plugin development plans include templates that can be used
with 1-2 lines of code in serverless.yml**

### Usage
```yml
functions:
  under-newrelic-mntrng:
    handler: handler.endpoint
    alerts:
      policy_service_token: arn:aws:lambda:<rest of a Lambda ARN>
      nrql_condition_service_token: arn:aws:lambda:<rest of a Lambda ARN>
      infrastructure_condition_service_token: arn:aws:lambda:<rest of a Lambda ARN>
      policies:
        - name: Plugin Policy Test
          incident_preference: PER_POLICY
      infrastructure_conditions:
        - policy_id: 1069205
          data:
            type: infra_metric
            name: Infra 10s auto created
            enabled: true
            filter:
              and:
                - in:
                    displayName:
                      - ${self:service}-dev-another-one
            violation_close_timer: 24
            created_at_epoch_millis: 1601565802841
            updated_at_epoch_millis: 1602228391394
            policy_id: 1069205
            event_type: ServerlessSample
            select_value: provider.duration.Average
            comparison: above
            critical_threshold:
              value: 10000
              duration_minutes: 5
              time_function: all
            integration_provider: LambdaFunction
      nrql_conditions:
        - name: NRQL Alert Condition Test
          policy_id: <id of the parent policy>
          enabled: false
          terms:
          - duration: '1'
            operator: 'equal'
            priority: 'critical'
            threshold: '1.0'
            time_function: 'all'
          nrql:
            query: 'SELECT count(*) FROM AwsLambdaInvocationError FACET currentTime'
            since_value: '1'
    events:
      - http:
          path: ping
          method: get
plugins:
    - serverless-newrelic-alerts
```
Plugin generates and adds the following resources for the CloudFormation configurations:
```json
{
    "UnderDashnewrelicDashmntrngLambdaFunctionPluginPolicyTestPolicy": {
      "Type": "Custom::NewRelicPolicy",
      "Properties": {
        "ServiceToken": "arn:aws:lambda:<rest of a Lambda ARN>",
        "policy": {
          "name": "Plugin Policy Test",
          "incident_preference": "PER_POLICY"
        }
      }
    },
    "UnderDashnewrelicDashmntrngLambdaFunctionInfra10sautocreatedInfrastructureCondition": {
      "Type": "Custom::NewRelicInfrastructureCondition",
      "Properties": {
        "ServiceToken": "arn:aws:lambda:<rest of a Lambda ARN>",
        "policy_id": 1069205,
        "data": {
          "type": "infra_metric",
          "name": "Infra 10s auto",
          "enabled": true,
          "filter": {
            "and": [
              {
                "in": {
                  "displayName": [
                    "poc-newrelic-alert-uses-custom-dev-another-one"
                  ]
                }
              }
            ]
          },
          "violation_close_timer": 12,
          "created_at_epoch_millis": 4601565802841,
          "updated_at_epoch_millis": 4602228391394,
          "policy_id": 1069205,
          "event_type": "ServerlessSample",
          "select_value": "provider.duration.Average",
          "comparison": "above",
          "critical_threshold": {
            "value": 10000,
            "duration_minutes": 5,
            "time_function": "all"
          },
          "integration_provider": "LambdaFunction"
        }
      }
    },
    "UnderDashnewrelicDashmntrngLambdaFunctionAlertConditionTestNrqlCondition": {
      "Type": "Custom::NewRelicNrqlCondition",
      "Properties": {
        "ServiceToken": "arn:aws:lambda:<rest of a Lambda ARN>",
        "policy_id": 100000000000000,
        "nrql_condition": {
          "name": "Alert Condition Test",
          "enabled": false,
          "terms": [
            {
              "duration": "1",
              "operator": "equal",
              "priority": "critical",
              "threshold": "1.0",
              "time_function": "all"
            }
          ],
          "nrql": {
            "query": "SELECT count(*) FROM AwsLambdaInvocationError FACET currentTime",
            "since_value": "1"
          }
        }
      }
    }
}
```
