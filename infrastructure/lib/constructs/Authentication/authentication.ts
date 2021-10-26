import * as cdk from '@aws-cdk/core';
import * as cognito from '@aws-cdk/aws-cognito';
import { truncate } from 'fs';

export interface AuthenticationProps {

}

export class Authentication extends cdk.Construct {

    public readonly userPool: cognito.IUserPool;

    public readonly userPoolClient: cognito.IUserPoolClient;

    constructor(scope: cdk.Construct, id: string) {
        super(scope, id);

       this.userPool = new cognito.UserPool(this, 'UserPool', {
            selfSignUpEnabled: false,
            autoVerify: {
                email: true
            },
            signInAliases: {
                email: true,
            },
            standardAttributes: {
                fullname: {
                    required: true,
                    mutable: true
                },
                phoneNumber: {
                    required: false,
                    mutable: true
                },
                profilePicture: {
                    required: false,
                    mutable: true
                }
            }
        });

        this.userPoolClient = new cognito.UserPoolClient(this, 'UserPoolClient', {
            userPool: this.userPool,
            generateSecret: false,
            authFlows: {
                adminUserPassword: true,
                userSrp: true,
            }
        });

        // Groups ----------------------------------------------

        new cognito.CfnUserPoolGroup(this, 'AdminGroup', {
            userPoolId: this.userPool.userPoolId,
            groupName: 'admin',
            precedence: 1,
            description: 'Admin users',
        });

        new cognito.CfnUserPoolGroup(this, 'ContributorGroup', {
            userPoolId: this.userPool.userPoolId,
            groupName: 'contributor',
            precedence: 5,
            description: 'Users who can manager documents but no users',
        });

        new cognito.CfnUserPoolGroup(this, 'ReaderGroup', {
            userPoolId: this.userPool.userPoolId,
            groupName: 'reader',
            precedence: 10,
            description: 'Users who can read documents but not edit',
        });
    }
}