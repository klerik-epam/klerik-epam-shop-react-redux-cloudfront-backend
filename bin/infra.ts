#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { ProductServiceStack } from '../lib/product-service-stack';
import { ImportServiceStack } from "../lib/import-service-stack";
import { AuthorizationServiceStack } from "../lib/authorization-service";

const app = new cdk.App();

const authStack = new AuthorizationServiceStack(app, 'AuthorizationServiceStack', {});

new ProductServiceStack(app, 'ProductServiceStack', {});
new ImportServiceStack(app, 'ImportServiceStack', {
  env: { },
  // @ts-ignore
  basicAuthorizerFn: authStack.basicAuthorizerFn,
});
