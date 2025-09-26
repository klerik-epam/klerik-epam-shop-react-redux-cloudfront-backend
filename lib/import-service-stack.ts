import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { createImportBucket } from "../src/s3/import/import-bucket";
import { createImportsLambdas } from "../src/infrastructure/import/create-import-lambdas";
import {createImportServiceApi} from "../src/infrastructure/import/create-import-service-api";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as lambdaEvents from 'aws-cdk-lib/aws-lambda-event-sources';

export class ImportServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const importBucket = createImportBucket(this);
    const lambdasRaw = createImportsLambdas(this, importBucket.bucketName);

    importBucket.grantPut(lambdasRaw.importProductsFileLambda);
    importBucket.grantReadWrite(lambdasRaw.importFileParserLambda);

    createImportServiceApi(this, {
      importProductsFileLambda: new apigateway.LambdaIntegration(lambdasRaw.importProductsFileLambda),
    })

    // S3 Trigger: викликати лямбду при додаванні файлу в папку "uploaded/"
    lambdasRaw.importFileParserLambda.addEventSource(new lambdaEvents.S3EventSource(importBucket, {
      events: [ s3.EventType.OBJECT_CREATED ],
      filters: [{ prefix: 'uploaded/', suffix: '.csv' }],
    }));
  }
}
