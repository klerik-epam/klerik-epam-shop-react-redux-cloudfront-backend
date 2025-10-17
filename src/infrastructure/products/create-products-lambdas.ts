import * as path from 'path';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';

export function createProductsLambdas(scope: Construct, bucketName?: string) {
  const getProductsListLambda = new lambdaNodejs.NodejsFunction(scope, 'GetProductsListLambda', {
    runtime: lambda.Runtime.NODEJS_20_X,
    entry: path.join(__dirname, '../../lambdas/products/getProductsList.ts'),
    handler: 'main',
    bundling: { minify: true, target: 'es2020', sourceMap: false }
  });

  const getProductByIdLambda = new lambdaNodejs.NodejsFunction(scope, 'GetProductByIdLambda', {
    runtime: lambda.Runtime.NODEJS_20_X,
    entry: path.join(__dirname, '../../lambdas/products/getProductById.ts'),
    handler: 'main',
    bundling: { minify: true, target: 'es2020', sourceMap: false }
  });

  const createProductLambda = new lambdaNodejs.NodejsFunction(scope, 'CreateProductLambda', {
    runtime: lambda.Runtime.NODEJS_20_X,
    entry: path.join(__dirname, '../../lambdas/products/createProduct.ts'),
    handler: 'main',
    bundling: { minify: true, target: 'es2020', sourceMap: false }
  });

  // PUT /product/{productId}
  const updateProductLambda = new lambdaNodejs.NodejsFunction(scope, 'UpdateProductLambda', {
    runtime: lambda.Runtime.NODEJS_20_X,
    entry: path.join(__dirname, '../../lambdas/products/updateProduct.ts'),
    handler: 'main',
    bundling: { minify: true, target: 'es2020', sourceMap: false },
  });

  const openApiJsonLambda = new lambdaNodejs.NodejsFunction(scope, 'OpenApiJsonLambda', {
    runtime: lambda.Runtime.NODEJS_20_X,
    entry: path.join(__dirname, '../../lambdas/docs/getOpenApiJson.ts'),
    handler: 'main',
    bundling: { minify: true, target: 'es2020', sourceMap: false }
  });

  const swaggerUiLambda = new lambdaNodejs.NodejsFunction(scope, 'SwaggerUiLambda', {
    runtime: lambda.Runtime.NODEJS_20_X,
    entry: path.join(__dirname, '../../lambdas/docs/getSwaggerUi.ts'),
    handler: 'main',
    bundling: { minify: true, target: 'es2020', sourceMap: false }
  });

  // НОВЕ: Batch процес через SQS
  const catalogBatchProcessLambda = new lambdaNodejs.NodejsFunction(scope, 'CatalogBatchProcessLambda', {
    runtime: lambda.Runtime.NODEJS_20_X,
    entry: path.join(__dirname, '../../lambdas/products/catalogBatchProcess.ts'),
    handler: 'main',
    bundling: { minify: true, target: 'es2020', sourceMap: false }
  });

  return {
    getProductsListLambda,
    getProductByIdLambda,
    createProductLambda,
    updateProductLambda,
    openApiJsonLambda,
    swaggerUiLambda,
    catalogBatchProcessLambda
  };
}
