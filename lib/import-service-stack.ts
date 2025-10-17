import * as cdk from 'aws-cdk-lib';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { createImportBucket } from "../src/s3/import/import-bucket";
import { createImportsLambdas } from "../src/infrastructure/import/create-import-lambdas";
import { createImportServiceApi } from "../src/infrastructure/import/create-import-service-api";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaEvents from 'aws-cdk-lib/aws-lambda-event-sources';

export interface ImportServiceStackProps extends cdk.StackProps {
  basicAuthorizerFn: lambda.IFunction;
}

export class ImportServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ImportServiceStackProps) {
    super(scope, id, props);

    const importBucket = createImportBucket(this);
    const lambdasRaw = createImportsLambdas(this, importBucket.bucketName);

    importBucket.grantPut(lambdasRaw.importProductsFileLambda);
    importBucket.grantReadWrite(lambdasRaw.importFileParserLambda);

    const tokenAuthorizer = new apigateway.TokenAuthorizer(this, 'ImportBasicTokenAuthorizer', {
      handler: props.basicAuthorizerFn,
      resultsCacheTtl: cdk.Duration.seconds(0),
    });

    createImportServiceApi(this, {
      importProductsFileLambda: new apigateway.LambdaIntegration(lambdasRaw.importProductsFileLambda),
      authorizer: tokenAuthorizer,
    });

    // SQS із Product Service
    const catalogItemsQueue = sqs.Queue.fromQueueArn(
      this,
      'CatalogItemsQueueImported',
      `arn:aws:sqs:${this.region}:${this.account}:catalogItemsQueue`
    );

    catalogItemsQueue.grantSendMessages(lambdasRaw.importFileParserLambda);
    lambdasRaw.importFileParserLambda.addEnvironment('SQS_URL', catalogItemsQueue.queueUrl);

    // S3 Trigger
    lambdasRaw.importFileParserLambda.addEventSource(new lambdaEvents.S3EventSource(importBucket, {
      events: [ s3.EventType.OBJECT_CREATED ],
      filters: [{ prefix: 'uploaded/', suffix: '.csv' }],
    }));
  }
}
