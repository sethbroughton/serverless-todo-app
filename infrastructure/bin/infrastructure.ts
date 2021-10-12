#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { InfrastructureStack } from '../lib/infrastructure-stack';
import { WebsiteStack } from '../lib/website-stack';

const app = new cdk.App();
new InfrastructureStack(app, 'InfrastructureStack', {});
new WebsiteStack(app, 'WebsiteStack', {});
