import * as cdk from '@aws-cdk/core';
import { RestApi } from '@aws-cdk/aws-apigateway';
import { Authentication } from './constructs/Authentication/authentication'
import { DatabaseAPI } from './constructs/Database/database';

export class InfrastructureStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new Authentication(this, 'TodoApp-authentication');

    const api = new RestApi(this, 'TodoApp-ApiGateway');

    new DatabaseAPI(this, 'Database-API', {
      RestApi: api
    })

  }

}
