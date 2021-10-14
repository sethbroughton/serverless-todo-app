import * as cdk from '@aws-cdk/core';
import { RestApi, Cors, UsagePlanProps, Period } from '@aws-cdk/aws-apigateway';
import { Authentication } from './constructs/Authentication/authentication'
import { DatabaseAPI } from './constructs/Database/database';
import * as secretsmanager from '@aws-cdk/aws-secretsmanager';

export class InfrastructureStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new Authentication(this, 'TodoApp-authentication');

    const api = new RestApi(this, 'TodoApp-ApiGateway', {
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
        allowMethods: Cors.ALL_METHODS,
        allowHeaders: ['x-api-key']
      }
    });

    const secret = new secretsmanager.Secret(this, 'Secret', {
      generateSecretString: {
        generateStringKey: 'api_key',
        secretStringTemplate: JSON.stringify({ username: 'web_user' }),
        excludeCharacters: ' %+~`#$&*()|[]{}:;<>?!\'/@"\\',
      },
    })

    const apiKey = api.addApiKey('ApiKey', {
      apiKeyName: 'todo-app-api-key-v2',
      defaultCorsPreflightOptions: {
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
          'Access-Control-Allow-Methods',
          'Access-Control-Allow-Headers',
          'Access-Control-Allow-Origin'
        ],
        allowMethods: ['OPTIONS', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        allowCredentials: true,
        allowOrigins: ['http://localhost:3000'],

      },
      value: secret.secretValueFromJson('api_key').toString()
    })

    const usagePlanProps: UsagePlanProps = {
      name: "MyUsagePlan",
      apiKey,
      apiStages: [{ api: api, stage: api.deploymentStage }],
      throttle: { burstLimit: 500, rateLimit: 1000 }, quota: { limit: 10000000, period: Period.MONTH }
    }

    api.addUsagePlan('MyUsagePlan', usagePlanProps);

    new DatabaseAPI(this, 'Database-API', {
      RestApi: api
    })

  }

}
