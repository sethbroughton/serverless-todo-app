import * as cdk from '@aws-cdk/core';
import { RestApi, Cors, UsagePlan, Deployment, UsagePlanProps, Period} from '@aws-cdk/aws-apigateway';
import { Authentication } from './constructs/Authentication/authentication'
import { DatabaseAPI } from './constructs/Database/database';
import * as secretsmanager from '@aws-cdk/aws-secretsmanager';
import { Stage } from '@aws-cdk/core';
import { countReset } from 'console';

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
