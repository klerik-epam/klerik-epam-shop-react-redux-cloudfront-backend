import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export function createImportBucket(scope: Construct) {
  return new s3.Bucket(scope, 'ImportBucket', {
    removalPolicy: cdk.RemovalPolicy.DESTROY,
    autoDeleteObjects: true,
    cors: [{
      allowedOrigins: ['*'],
      allowedMethods: [s3.HttpMethods.PUT, s3.HttpMethods.GET, s3.HttpMethods.HEAD],
      allowedHeaders: ['*'],
      exposedHeaders: ['ETag'],
      maxAge: 3000,
    }],
  });
}
