import * as path from 'path';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';

export function createLambdas(scope: Construct) {
  const getProductsListLambda = new lambdaNodejs.NodejsFunction(scope, 'GetProductsListLambda', {
    runtime: lambda.Runtime.NODEJS_20_X,
    entry: path.join(__dirname, '../lib/lambda/handlers/getProductsList.js'),
    handler: 'main',
    bundling: { minify: true, target: 'es2020', sourceMap: false }
  });

  const getProductByIdLambda = new lambdaNodejs.NodejsFunction(scope, 'GetProductByIdLambda', {
    runtime: lambda.Runtime.NODEJS_20_X,
    entry: path.join(__dirname, '../lib/lambda/handlers/getProductById.js'),
    handler: 'main',
    bundling: { minify: true, target: 'es2020', sourceMap: false }
  });

  const openApiJsonLambda = new lambdaNodejs.NodejsFunction(scope, 'OpenApiJsonLambda', {
    runtime: lambda.Runtime.NODEJS_20_X,
    entry: path.join(__dirname, '../lib/lambda/docs/getOpenApiJson.js'),
    handler: 'main',
    bundling: { minify: true, target: 'es2020', sourceMap: false }
  });

  const swaggerUiLambda = new lambdaNodejs.NodejsFunction(scope, 'SwaggerUiLambda', {
    runtime: lambda.Runtime.NODEJS_20_X,
    entry: path.join(__dirname, '../lib/lambda/docs/getSwaggerUi.js'),
    handler: 'main',
    bundling: { minify: true, target: 'es2020', sourceMap: false }
  });

  return { getProductsListLambda, getProductByIdLambda, openApiJsonLambda, swaggerUiLambda };
}
