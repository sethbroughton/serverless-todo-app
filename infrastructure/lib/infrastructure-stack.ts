import * as cdk from '@aws-cdk/core';
import { RestApi, Cors, UsagePlan, Deployment } from '@aws-cdk/aws-apigateway';
import { Authentication } from './constructs/Authentication/authentication'
import { DatabaseAPI } from './constructs/Database/database';
import * as secretsmanager from '@aws-cdk/aws-secretsmanager';
import { Stage } from '@aws-cdk/core';

export class InfrastructureStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new Authentication(this, 'TodoApp-authentication');

    const api = new RestApi(this, 'TodoApp-ApiGateway');

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
        allowOrigins: Cors.ALL_ORIGINS,
      },
      value: secret.secretValueFromJson('api_key').toString()
    })

    const usagePlan = new UsagePlan(this, 'ApiUsagePlan');
    usagePlan.addApiKey(apiKey);
    api.addUsagePlan('UsagePlan');

    new DatabaseAPI(this, 'Database-API', {
      RestApi: api
    })

  }

}
