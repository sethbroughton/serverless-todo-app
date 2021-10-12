import * as cdk from '@aws-cdk/core';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as apigw from '@aws-cdk/aws-apigateway';
import * as iam from '@aws-cdk/aws-iam';
import { AwsIntegration, RestApi } from '@aws-cdk/aws-apigateway';

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

    const apigatewayIamRole = new iam.Role(this, "DefaultGatewayRole", {
      assumedBy: new iam.ServicePrincipal("apigateway.amazonaws.com")
    });

    table.grantReadWriteData(apigatewayIamRole);

    const responseModel = api.addModel("ResponseModel", {
      contentType: "application/json",
      modelName: "responseModel",
      schema: {
        schema: apigw.JsonSchemaVersion.DRAFT4,
        title: "poleResponse",
        type: apigw.JsonSchemaType.OBJECT,
        properties: {
          name: {
            type: apigw.JsonSchemaType.STRING
          }
        }
      }
    });

    const errorResponseModel = api.addModel("ErrorResponseModel", {
      contentType: "application/json",
      modelName: "ErrorModel",
      schema: {
        schema: apigw.JsonSchemaVersion.DRAFT4,
        title: "errorResponse",
        type: apigw.JsonSchemaType.OBJECT,
        properties: {
          state: {
            type: apigw.JsonSchemaType.STRING
          },
          message: { type: apigw.JsonSchemaType.STRING }
        }
      }
    });

    api.root.addResource('PostTodo')
      .addMethod('POST', new apigw.Integration({
        type: apigw.IntegrationType.AWS,  //native AWS integration
        integrationHttpMethod: "POST",
        uri: 'arn:aws:apigateway:us-east-1:dynamodb:action/PutItem', // dynamoDB put operation
        options: {
          credentialsRole: apigatewayIamRole,
          requestTemplates: {
            'application/json': JSON.stringify({
              'TableName': table.tableName, 'Item': {
                'id': { 'S': "$input.path('$.id')" },
                'task': { 'S': "$input.path('$.task')" },
                'isCompleted': { 'B': "$input.path('$.isCompleted')" }
              }
            })
          },
          passthroughBehavior: apigw.PassthroughBehavior.NEVER,
          integrationResponses: [
            {
              //based on response, this tells api gateway what to send back
              statusCode: "200",
              responseTemplates: {
                'application/json': JSON.stringify({ message: 'item added to db' })
              }
            },
            {
              selectionPattern: '^\[BadRequest\].*',
              statusCode: "400",
              responseTemplates: {
                'application/json': JSON.stringify({ state: 'error', message: "$util.escapeJavaScript($input.path('$.errorMessage'))" })
              },
              responseParameters: {
                'method.response.header.Content-Type': "'application/json'",
                'method.response.header.Access-Control-Allow-Origin': "'*'",
                'method.response.header.Access-Control-Allow-Credentials': "'true'"
              }
            }
          ]
        }
      }),
        {
          methodResponses: [ //We need to define what models are allowed on our method response
            {
              // Successful response from the integration
              statusCode: '200',
              // Define what parameters are allowed or not
              responseParameters: {
                'method.response.header.Content-Type': true,
                'method.response.header.Access-Control-Allow-Origin': true,
                'method.response.header.Access-Control-Allow-Credentials': true
              },
              // Validate the schema on the response
              responseModels: {
                'application/json': responseModel
              }
            },
            {
              // Same thing for the error responses
              statusCode: '400',
              responseParameters: {
                'method.response.header.Content-Type': true,
                'method.response.header.Access-Control-Allow-Origin': true,
                'method.response.header.Access-Control-Allow-Credentials': true
              },
              responseModels: {
                'application/json': errorResponseModel
              }
            }
          ]
        })

    const errorResponses = [
      {
        selectionPattern: '400',
        statusCode: '400',
        responseTemplates: {
          'application/json': `{
                  "error": "Bad input!"
                }`,
        },
      },
      {
        selectionPattern: '5\\d{2}',
        statusCode: '500',
        responseTemplates: {
          'application/json': `{
                  "error": "Internal Service Error!"
                }`,
        },
      },
    ];

    const integrationResponses =
      [
        {
          //based on response, this tells api gateway what to send back
          statusCode: "200",
          responseTemplates: {
            'application/json':
              `#set($inputRoot = $input.path('$'))
                {
                    "task": [
                        #foreach($elem in $inputRoot.Items) {
                            "id": "$elem.id.S",
                            "task": "$elem.task.S",
                            "isCompleted": "$elem.isCompleted.B"
                        }#if($foreach.hasNext),#end
                    #end
                    ]
                }`
          }
        },
        ...errorResponses
      ]



    const getAllIntegration = new AwsIntegration({
      action: 'Scan',
      options: {
        credentialsRole: apigatewayIamRole,
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

    const allResources = api.root.addResource('todos');

    const methodOptions = { methodResponses: [{ statusCode: '200' }, { statusCode: '400' }, { statusCode: '500' }] };

    allResources.addMethod('GET', getAllIntegration, methodOptions);

    // api.root.addResource('todos')
    //     .addMethod('GET', new apigw.Integration({
    //         type: apigw.IntegrationType.AWS,  //native AWS integration
    //         integrationHttpMethod: "GET",
    //         uri: 'arn:aws:apigateway:us-east-1:dynamodb:action/Scan', // dynamoDB get operation
    //         options: {
    //             credentialsRole: apigatewayIamRole,
    //             requestTemplates: {
    //                 'application/json': JSON.stringify(
    //                     {
    //                         "TableName": table.tableName,
    //                     }
    //                 )
    //             },
    //             passthroughBehavior: apigw.PassthroughBehavior.NEVER,
    //             integrationResponses: [
    //                 {
    //                     //based on response, this tells api gateway what to send back
    //                     statusCode: "200",
    //                     responseTemplates: {
    //                         'application/json': 
    //                         `#set($inputRoot = $input.path('$'))
    //                         {
    //                             "task": [
    //                                 #foreach($elem in $inputRoot.Items) {
    //                                     "id": "$elem.id.S",
    //                                     "task": "$elem.task.S",
    //                                     "isCompleted": "$elem.isCompleted.B"
    //                                 }#if($foreach.hasNext),#end
    //                             #end
    //                             ]
    //                         }`
    //                     }
    //                 },
    //                 {
    //                     selectionPattern: '^\[BadRequest\].*',
    //                     statusCode: "400",
    //                     responseTemplates: {
    //                         'application/json': JSON.stringify({ state: 'error', message: "$util.escapeJavaScript($input.path('$.errorMessage'))" })
    //                     },
    //                     responseParameters: {
    //                         'method.response.header.Content-Type': "'application/json'",
    //                         'method.response.header.Access-Control-Allow-Origin': "'*'",
    //                         'method.response.header.Access-Control-Allow-Credentials': "'true'"
    //                     }
    //                 }
    //             ]
    //         }
    //     }),
    //         {
    //             methodResponses: [ //We need to define what models are allowed on our method response
    //                 {
    //                     // Successful response from the integration
    //                     statusCode: '200',
    //                     // Define what parameters are allowed or not
    //                     responseParameters: {
    //                         'method.response.header.Content-Type': true,
    //                         'method.response.header.Access-Control-Allow-Origin': true,
    //                         'method.response.header.Access-Control-Allow-Credentials': true
    //                     },
    //                     // Validate the schema on the response
    //                     responseModels: {
    //                         'application/json': responseModel
    //                     }
    //                 },
    //                 {
    //                     // Same thing for the error responses
    //                     statusCode: '400',
    //                     responseParameters: {
    //                         'method.response.header.Content-Type': true,
    //                         'method.response.header.Access-Control-Allow-Origin': true,
    //                         'method.response.header.Access-Control-Allow-Credentials': true
    //                     },
    //                     responseModels: {
    //                         'application/json': errorResponseModel
    //                     }
    //                 }
    //             ]
    //         })


  }
}