import * as cdk from '@aws-cdk/core';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as iam from '@aws-cdk/aws-iam';
import { AwsIntegration, RestApi } from '@aws-cdk/aws-apigateway';
import { Effect, PolicyStatement, Role, ServicePrincipal } from '@aws-cdk/aws-iam';

export interface DatabaseAPIProps {
  RestApi: RestApi
}

export class DatabaseAPI extends cdk.Construct {
  constructor(scope: cdk.Construct, id: string, props: DatabaseAPIProps) {
    super(scope, id);

    const api = props.RestApi;

    const table = new dynamodb.Table(this, 'TodoApp-Table', {
      partitionKey: {
        name: "id",
        type: dynamodb.AttributeType.STRING
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST
    });

    const putPolicy = new iam.Policy(this, 'putPolicy', {
      statements: [
        new PolicyStatement({
          actions: ['dynamodb:PutItem'],
          effect: Effect.ALLOW,
          resources: [table.tableArn],
        }),
      ],
    });

    const putRole = new Role(this, 'putRole', {
      assumedBy: new ServicePrincipal('apigateway.amazonaws.com')
    });

    putRole.attachInlinePolicy(putPolicy);

    const getPolicy = new iam.Policy(this, 'getPolicy', {
      statements: [
        new PolicyStatement({
          actions: ['dynamodb:GetItem'],
          effect: Effect.ALLOW,
          resources: [table.tableArn]
        }),
      ],
    });

    const getRole = new Role(this, 'getRole', {
      assumedBy: new ServicePrincipal('apigateway.amazonaws.com')
    });

    getRole.attachInlinePolicy(getPolicy);

    const deletePolicy = new iam.Policy(this, 'deletePolicy', {
      statements: [
        new PolicyStatement({
          actions: ['dynamodb:DeleteItem'],
          effect: Effect.ALLOW,
          resources: [table.tableArn]
        }),
      ],
    });

    const deleteRole = new Role(this, 'deleteRole', {
      assumedBy: new ServicePrincipal('apigateway.amazonaws.com')
    });

    deleteRole.attachInlinePolicy(deletePolicy);

    const scanPolicy = new iam.Policy(this, 'scanPolicy', {
      statements: [
        new PolicyStatement({
          actions: ['dynamodb:Scan'],
          effect: Effect.ALLOW,
          resources: [table.tableArn]
        }),
      ],
    });

    const scanRole = new Role(this, 'scanRole', {
      assumedBy: new ServicePrincipal('apigateway.amazonaws.com')
    });

    scanRole.attachInlinePolicy(scanPolicy);

    const errorResponses = [
      {
        selectionPattern: '400',
        statusCode: '400',
        responseTemplates: {
          'application/json': `{
                  "error": "Bad input!"
                }`,
        },
        responseParameters: {
          'method.response.header.Content-Type': "'application/json'",
          'method.response.header.Access-Control-Allow-Origin': "'*'",
          'method.response.header.Access-Control-Allow-Credentials': "'true'"
      }
      },
      {
        selectionPattern: '5\\d{2}',
        statusCode: '500',
        responseTemplates: {
          'application/json': `{
                  "error": "Internal Service Error!"
                }`,
        },
        responseParameters: {
          'method.response.header.Content-Type': "'application/json'",
          'method.response.header.Access-Control-Allow-Origin': "'*'",
          'method.response.header.Access-Control-Allow-Credentials': "'true'"
      }
      },
    ];

    const integrationResponses = [
      {
        statusCode: '200',
        responseParameters: {
        'method.response.header.Content-Type': "'application/json'",
        'method.response.header.Access-Control-Allow-Origin': "'*'",
        'method.response.header.Access-Control-Allow-Credentials': "'true'"
    }
      },
      ...errorResponses,
    ];

    const allResources = api.root.addResource("todos");
    // allResources.addCorsPreflight({
    //   allowOrigins: ['*'],
    //   allowMethods: ['*'],
    //   allowCredentials: true,
    // })

    const oneResource = allResources.addResource('{id}');

    const getAllIntegration = new AwsIntegration({
      action: 'Scan',
      options: {
        credentialsRole: scanRole,
        integrationResponses,
        requestTemplates: {
          'application/json': JSON.stringify(
            {
              "TableName": table.tableName
            }
          )
        },
      },
      service: 'dynamodb'
    })

    const createIntegration = new AwsIntegration({
      action: 'PutItem',
      options: {
        credentialsRole: putRole,
        integrationResponses: [
          {
            statusCode: '200',
            responseTemplates: {
              'application/json': JSON.stringify({
                "requestId": "$context.requestId"
              })
            },
          },
          ...errorResponses
        ],
        requestTemplates: {
          'application/json': JSON.stringify({
            'TableName': table.tableName, 'Item': {
              'id': { 'S': "$input.path('$.id')" },
              'task': { 'S': "$input.path('$.task')" },
              'isCompleted': { 'B': "$input.path('$.isCompleted')" }
            }
          })
        },
      },
      service: 'dynamodb'
    })

    const deleteIntegration = new AwsIntegration({
      action: 'DeleteItem',
      options: {
        credentialsRole: deleteRole,
        integrationResponses,
        requestTemplates: {
          'application/json': JSON.stringify({
            "Key": {
              "id": {
                "S": "$method.request.path.id"
              }
            },
            "TableName": table.tableName
          })
        }
      },
      service: 'dynamodb',
    });

    const getIntegration = new AwsIntegration({
      action: 'GetItem',
      options: {
        credentialsRole: getRole,
        integrationResponses,
        requestTemplates: {
          'application/json': JSON.stringify({
            "Key": {
              "id": {
                "S": "$method.request.path.id"
              }
            },
            "TableName": table.tableName
          }),
        },
      },
      service: 'dynamodb'
    });

    const updateIntegration = new AwsIntegration({
      action: 'PutItem',
      options: {
        credentialsRole: putRole,
        integrationResponses,
        requestTemplates: {
          'application/json': JSON.stringify({
            "Item": {
              "id": {
                "S": "$method.request.path.id"
              },
              "task": {
                "S": "$input.path('$.task')"
              },
              "isCompleted": {
                "S": "$input.path('$.isCompleted')"
              }
            },
            "TableName": table.tableName
          }),
        }
      },
      service: 'dynamodb'
    })

    const methodOptions = {
      methodResponses: [
        {
          statusCode: '200',
          responseParameters: {
            'method.response.header.Content-Type': true,
            'method.response.header.Access-Control-Allow-Origin': true,
            'method.response.header.Access-Control-Allow-Credentials': true
          },
        },
        {
          statusCode: '400',
          responseParameters: {
            'method.response.header.Content-Type': true,
            'method.response.header.Access-Control-Allow-Origin': true,
            'method.response.header.Access-Control-Allow-Credentials': true
          },
        }, {
          statusCode: '500',
          'method.response.header.Content-Type': true,
          'method.response.header.Access-Control-Allow-Origin': true,
          'method.response.header.Access-Control-Allow-Credentials': true
        }],
      apiKeyRequired: true
    };

    allResources.addMethod('GET', getAllIntegration, methodOptions);
    allResources.addMethod('Post', createIntegration, methodOptions);

    oneResource.addMethod('DELETE', deleteIntegration, methodOptions);
    oneResource.addMethod('GET', getIntegration, methodOptions);
    oneResource.addMethod('PUT', updateIntegration, methodOptions);

    // allResources.addCorsPreflight({
    //   allowOrigins: [ 'https://amazon.com' ],
    //   allowMethods: [ 'GET', 'PUT' ]
    // });



  }
}