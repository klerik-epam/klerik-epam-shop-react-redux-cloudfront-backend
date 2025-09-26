import * as path from 'path';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';

export function createImportsLambdas(scope: Construct, bucketName: string) {
  const importProductsFileLambda = new lambdaNodejs.NodejsFunction(scope, 'ImportProductsFileLambda', {
    runtime: lambda.Runtime.NODEJS_20_X,
    entry: path.join(__dirname, '../../lambdas/import/importProductsFile.ts'),
    handler: 'main',
    bundling: { minify: true, target: 'es2020', sourceMap: false },
    environment: {
      BUCKET_NAME: bucketName,
    }
  });

  const importFileParserLambda = new lambdaNodejs.NodejsFunction(scope, 'ImportFileParserLambda', {
    runtime: lambda.Runtime.NODEJS_20_X,
    entry: path.join(__dirname, '../../lambdas/import/importFileParser.ts'),
    handler: 'main',
    bundling: { minify: true, target: 'es2020', sourceMap: false },
    environment: {
      BUCKET_NAME: bucketName
    }
  });

  return {
    importProductsFileLambda,
    importFileParserLambda
  };
}
