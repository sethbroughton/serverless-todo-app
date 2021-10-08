import * as cdk from '@aws-cdk/core';
import { SPADeploy } from 'cdk-spa-deploy';


export class InfrastructureStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new SPADeploy(this, 'websiteDeploy')
      .createSiteWithCloudfront({
        indexDoc: 'index.html',
        websiteFolder: '../webapp/out'
      })
    }



}
