import Serverless from 'serverless'
import { ApiGatewayAlert, DynamoDbAlert, FunctionAlert, SqsAlert } from '../src/constants/alerts'
import { AlertsSet } from '../src/constants/alerts-set'

const NewRelicAlertsPlugin = require('../src')

describe('Newrelic Alert Plugin', () => {
  const logMock = jest.fn()
  const getServerless = (config: any, { resources, functions = [] }: any = {}): Serverless =>
    ({
      service: {
        custom: {
          newrelicAlerts: config
        },
        provider: {
          compiledCloudFormationTemplate: {
            Resources: resources
          }
        },
        getServiceName() {
          return 'test service'
        },
        getAllFunctionsNames() {
          return functions.map(({ displayName }) => displayName)
        },
        getAllFunctions() {
          return functions.map(({ name }) => name)
        },
        getFunction(functionName) {
          const fn = functions.find(({ name }) => name === functionName)
          return {
            alerts: fn.alerts,
            name: fn.displayName
          }
        }
      },
      getProvider() {
        return {
          getStage() {
            return 'test'
          }
        }
      },
      cli: {
        log: logMock
      }
    } as any)

  const minimalConfig = {
    policyServiceToken: 'policy-token',
    infrastructureConditionServiceToken: 'infrastructure-condition-token'
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('constructor', () => {
    it('should throw error if some of tokens are not provided', () => {
      expect(() => new NewRelicAlertsPlugin(getServerless({}))).toThrow()
    })

    it("shouldn't apply hooks if there is no plugin config", () => {
      const plugin = new NewRelicAlertsPlugin(getServerless(undefined))
      expect(plugin.hooks).toEqual({})
    })
  })

  describe('getPolicyCloudFormation', () => {
    it('should generate valid policy', () => {
      const plugin = new NewRelicAlertsPlugin(getServerless(minimalConfig))
      const policy = plugin.getPolicyCloudFormation()
      expect(policy).toMatchSnapshot()
    })
  })

  describe('getInfrastructureConditionCloudFormation', () => {
    it('should generate valid infrastructure condition', () => {
      const plugin = new NewRelicAlertsPlugin(getServerless(minimalConfig))
      const infrastructureCondition = plugin.getInfrastructureConditionCloudFormation(
        FunctionAlert.THROTTLES,
        ['fn-1', 'fn-2']
      )
      expect(infrastructureCondition).toMatchSnapshot()
    })
  })

  describe('checkEligibility', () => {
    it('should return true if there are both resources and alerts', () => {
      const plugin = new NewRelicAlertsPlugin(getServerless(minimalConfig))
      expect(plugin.checkEligibility([FunctionAlert.THROTTLES], ['some res'])).toBe(true)
    })

    it('should return false if there are no alerts', () => {
      const plugin = new NewRelicAlertsPlugin(getServerless(minimalConfig))
      expect(plugin.checkEligibility([], ['some res'])).toBe(false)
    })

    it('should return false if there are no resources', () => {
      const plugin = new NewRelicAlertsPlugin(getServerless(minimalConfig))
      expect(plugin.checkEligibility([], [])).toBe(false)
    })

    it('should log warn if there are no resources for alerts configured', () => {
      const plugin = new NewRelicAlertsPlugin(getServerless(minimalConfig))
      plugin.checkEligibility([FunctionAlert.THROTTLES], [])
      expect(logMock).toBeCalled()
    })
  })

  describe('getFunctionAlertsCloudFormation', () => {
    it('should generate global alerts for all functions', () => {
      const plugin = new NewRelicAlertsPlugin(
        getServerless(
          {
            ...minimalConfig,
            alerts: Object.values(FunctionAlert)
          },
          {
            functions: [
              {
                name: 'test-function',
                displayName: 'test-service-test-function'
              },
              {
                name: 'test-function-2',
                displayName: 'test-service-test-function-2'
              }
            ]
          }
        )
      )
      const cf = plugin.getFunctionAlertsCloudFormation()
      expect(cf).toMatchSnapshot()
    })

    it("shouldn't generate global alerts for function if alert disabled locally", () => {
      const plugin = new NewRelicAlertsPlugin(
        getServerless(
          {
            ...minimalConfig,
            alerts: Object.values(FunctionAlert)
          },
          {
            functions: [
              {
                name: 'test-function',
                displayName: 'test-service-test-function'
              },
              {
                name: 'test-function-2',
                displayName: 'test-service-test-function-2',
                alerts: [
                  {
                    name: FunctionAlert.THROTTLES,
                    enabled: false
                  }
                ]
              }
            ]
          }
        )
      )
      const cf = plugin.getFunctionAlertsCloudFormation()
      expect(cf.FunctionThrottlesInfrastructureCondition.Properties.data.filter).toMatchSnapshot()
    })

    it('should generate local defined alerts functions', () => {
      const plugin = new NewRelicAlertsPlugin(
        getServerless(
          {
            ...minimalConfig
          },
          {
            functions: [
              {
                name: 'test-function',
                displayName: 'test-service-test-function'
              },
              {
                name: 'test-function-2',
                displayName: 'test-service-test-function-2',
                alerts: [FunctionAlert.DURATION_1_SEC]
              }
            ]
          }
        )
      )
      const cf = plugin.getFunctionAlertsCloudFormation()
      expect(cf.FunctionDuration1SecInfrastructureCondition).toBeDefined()
      expect(
        cf.FunctionDuration1SecInfrastructureCondition.Properties.data.filter
      ).toMatchSnapshot()
    })

    it("shouldn't fail if there is no functions", () => {
      const plugin = new NewRelicAlertsPlugin(
        getServerless({
          ...minimalConfig,
          alerts: [...Object.values(FunctionAlert), ...Object.values(ApiGatewayAlert)]
        })
      )
      const cf = plugin.getFunctionAlertsCloudFormation()
      expect(cf).toEqual({})
    })

    it("shouldn't fail if there is no alerts", () => {
      const plugin = new NewRelicAlertsPlugin(
        getServerless(
          {
            ...minimalConfig,
            alerts: Object.values(ApiGatewayAlert)
          },
          {
            functions: [
              {
                name: 'test-function',
                displayName: 'test-service-test-function'
              }
            ]
          }
        )
      )
      const cf = plugin.getFunctionAlertsCloudFormation()
      expect(cf).toEqual({})
    })
  })

  describe('getApiGatewayAlertsCloudFormation', () => {
    it('should generate alerts for all api gateways', () => {
      const plugin = new NewRelicAlertsPlugin(
        getServerless(
          {
            ...minimalConfig,
            alerts: [...Object.values(FunctionAlert), ...Object.values(ApiGatewayAlert)]
          },
          {
            resources: {
              ApiGateway: {
                Type: 'AWS::ApiGateway::RestApi',
                Properties: {
                  Name: 'api-gatway'
                }
              },
              ApiGateway2: {
                Type: 'AWS::ApiGateway::RestApi',
                Properties: {
                  Name: 'api-gatway2'
                }
              }
            }
          }
        )
      )
      const cf = plugin.getApiGatewayAlertsCloudFormation()
      expect(cf).toMatchSnapshot()
    })

    it("shouldn't fail if there is no api gateways", () => {
      const plugin = new NewRelicAlertsPlugin(
        getServerless({
          ...minimalConfig,
          alerts: [...Object.values(FunctionAlert), ...Object.values(ApiGatewayAlert)]
        })
      )
      const cf = plugin.getApiGatewayAlertsCloudFormation()
      expect(cf).toEqual({})
    })

    it("shouldn't fail if there is no alerts", () => {
      const plugin = new NewRelicAlertsPlugin(
        getServerless(
          {
            ...minimalConfig,
            alerts: Object.values(FunctionAlert)
          },
          {
            resources: {
              ApiGateway: {
                Type: 'AWS::ApiGateway::RestApi',
                Properties: {
                  Name: 'api-gatway'
                }
              }
            }
          }
        )
      )
      const cf = plugin.getApiGatewayAlertsCloudFormation()
      expect(cf).toEqual({})
    })
  })

  describe('getSqsAlertsCloudFormation', () => {
    it('should generate alerts for all dead letter queues', () => {
      const plugin = new NewRelicAlertsPlugin(
        getServerless(
          {
            ...minimalConfig,
            alerts: [...Object.values(DynamoDbAlert), SqsAlert.DLQ_VISIBLE_MESSAGES]
          },
          {
            resources: {
              Queue: {
                Type: 'AWS::SQS::Queue',
                Properties: {
                  QueueName: 'simple-queue'
                }
              },
              QueueDlq: {
                Type: 'AWS::SQS::Queue',
                Properties: {
                  QueueName: 'simple-queue-dlq'
                }
              }
            }
          }
        )
      )
      const cf = plugin.getSqsAlertsCloudFormation()
      expect(cf).toMatchSnapshot()
    })

    it("shouldn't fail if there is no dead letter queues", () => {
      const plugin = new NewRelicAlertsPlugin(
        getServerless(
          {
            ...minimalConfig,
            alerts: [SqsAlert.DLQ_VISIBLE_MESSAGES, ...Object.values(ApiGatewayAlert)]
          },
          {
            resources: {
              Queue: {
                Type: 'AWS::SQS::Queue',
                Properties: {
                  QueueName: 'simple-queue'
                }
              }
            }
          }
        )
      )
      const cf = plugin.getSqsAlertsCloudFormation()
      expect(cf).toEqual({})
    })

    it("shouldn't fail if there is no alerts", () => {
      const plugin = new NewRelicAlertsPlugin(
        getServerless(
          {
            ...minimalConfig,
            alerts: Object.values(FunctionAlert)
          },
          {
            resources: {
              QueueDlq: {
                Type: 'AWS::SQS::Queue',
                Properties: {
                  QueueName: 'simple-queue-dlq'
                }
              }
            }
          }
        )
      )
      const cf = plugin.getSqsAlertsCloudFormation()
      expect(cf).toEqual({})
    })
  })

  describe('getDynamoDbAlertsCloudFormation', () => {
    it('should generate alerts for all dynamo tables', () => {
      const plugin = new NewRelicAlertsPlugin(
        getServerless(
          {
            ...minimalConfig,
            alerts: [...Object.values(DynamoDbAlert), ...Object.values(ApiGatewayAlert)]
          },
          {
            resources: {
              DynamoDBTable: {
                Type: 'AWS::DynamoDB::Table',
                Properties: {
                  TableName: 'dynamo-table'
                }
              },
              DynamoDBTable2: {
                Type: 'AWS::DynamoDB::Table',
                Properties: {
                  TableName: 'dynamo-table2'
                }
              }
            }
          }
        )
      )
      const cf = plugin.getDynamoDbAlertsCloudFormation()
      expect(cf).toMatchSnapshot()
    })

    it("shouldn't fail if there is no dynamo tables", () => {
      const plugin = new NewRelicAlertsPlugin(
        getServerless({
          ...minimalConfig,
          alerts: [...Object.values(DynamoDbAlert), ...Object.values(ApiGatewayAlert)]
        })
      )
      const cf = plugin.getDynamoDbAlertsCloudFormation()
      expect(cf).toEqual({})
    })

    it("shouldn't fail if there is no alerts", () => {
      const plugin = new NewRelicAlertsPlugin(
        getServerless(
          {
            ...minimalConfig,
            alerts: Object.values(FunctionAlert)
          },
          {
            resources: {
              DynamoDB: {
                Type: 'AWS::DynamoDB::Table',
                Properties: {
                  Name: 'dynamo-table'
                }
              }
            }
          }
        )
      )
      const cf = plugin.getDynamoDbAlertsCloudFormation()
      expect(cf).toEqual({})
    })
  })

  describe('getAlerts', () => {
    it('should spread all alerts set', () => {
      const plugin = new NewRelicAlertsPlugin(getServerless(minimalConfig))
      const alerts = plugin.getAlerts([AlertsSet.DYNAMO_DB_SYSTEM_ERRORS])
      expect(alerts).toEqual([
        DynamoDbAlert.BATCH_GET_SYSTEM_ERRORS,
        DynamoDbAlert.BATCH_WRITE_SYSTEM_ERRORS,
        DynamoDbAlert.DELETE_SYSTEM_ERRORS,
        DynamoDbAlert.GET_SYSTEM_ERRORS,
        DynamoDbAlert.PUT_SYSTEM_ERRORS,
        DynamoDbAlert.QUERY_SYSTEM_ERRORS,
        DynamoDbAlert.SCAN_SYSTEM_ERRORS,
        DynamoDbAlert.UPDATE_SYSTEM_ERRORS
      ])
      expect(alerts).not.toContain(AlertsSet.DYNAMO_DB_SYSTEM_ERRORS)
    })

    it('should filter out with warning all unknown alerts', () => {
      const plugin = new NewRelicAlertsPlugin(getServerless(minimalConfig))
      const alerts = plugin.getAlerts([FunctionAlert.THROTTLES, 'unknownAlert'])
      expect(alerts).toContain(FunctionAlert.THROTTLES)
      expect(alerts).not.toContain('unknownAlert')
    })
  })
})
