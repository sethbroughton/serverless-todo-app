import * as cdk from '@aws-cdk/core';
import { SPADeploy } from 'cdk-spa-deploy';
import { execSync } from 'child_process';
import * as path from 'path'

export class WebsiteStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

    execSync(`cd ${path.join(__dirname, '..', '..', 'webapp')} && npm i && npm run build`);

    new SPADeploy(this, 'websiteDeploy')
      .createSiteWithCloudfront({
        indexDoc: 'index.html',
        websiteFolder: '../webapp/out',
      })

    }
}