import * as cdk from '@aws-cdk/core';
import * as cognito from '@aws-cdk/aws-cognito';

export interface AuthenticationProps {

}

export class Authentication extends cdk.Construct {
    constructor(scope: cdk.Construct, id: string) {
        super(scope, id);

        const pool = new cognito.UserPool(this, 'myuserpool', {
            userPoolName: 'todoapp-userpool',
            selfSignUpEnabled: true,
            userVerification: {
                emailSubject: 'Verify your email for our todo app!',
                emailBody: 'Thanks for signing up to our todo app! Your verification code is {####}',
                emailStyle: cognito.VerificationEmailStyle.CODE,
            },
            signInAliases: {
                username: true,
            },
            customAttributes: {
                isAdmin: new cognito.BooleanAttribute({ mutable: true })
            },
            passwordPolicy: {
                minLength: 8,
                requireLowercase: true,
                requireUppercase: true,
                requireDigits: true,
            }
        });

        const client = pool.addClient('todo-app-client', {
            oAuth: {
                flows: {
                  implicitCodeGrant: true,
                  authorizationCodeGrant: true
                },
                callbackUrls: [
                  'https://d2lzu2s2ab91k6.cloudfront.net/',
                  'https://d2lzu2s2ab91k6.cloudfront.net/todos',
                ],
                logoutUrls: [
                    'https://https://d2lzu2s2ab91k6.cloudfront.net/'
                ],
                scopes: [
                    cognito.OAuthScope.PHONE,
                    cognito.OAuthScope.EMAIL,
                    cognito.OAuthScope.OPENID,
                    cognito.OAuthScope.PROFILE,
                    cognito.OAuthScope.COGNITO_ADMIN
                ]
              }
        });

        const domain = pool.addDomain('CognitoDomain', {
            cognitoDomain: {
                domainPrefix: 'todo-app-22981456'
            },
        })

        const signInUrl = domain.signInUrl(client, {
            redirectUri: 'https://myapp.com/home', // must be a URL configured under 'callbackUrls' with the client
          })


        const clientId = client.userPoolClientId;

        new cdk.CfnOutput(this, "theclientId", {
            value: clientId,
        })

    }
}