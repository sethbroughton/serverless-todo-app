import { InfrastructureStack } from "../lib/infrastructure-stack";
import { Stack } from "@aws-cdk/core";
import { expect as expectCDK, haveResource } from '@aws-cdk/assert'
import { DatabaseAPI } from "../lib/constructs/Database/database";
import { RestApi } from "@aws-cdk/aws-apigateway";

test('my initial test', () => {
    const stack = new Stack();
    //WHEN
    new DatabaseAPI(stack, 'MyTestConstruct',{
        RestApi: new RestApi(stack, 'testRestAPi')
    })

    //THEN
    expectCDK(stack).to(haveResource("AWS::DynamoDB::Table"));
})