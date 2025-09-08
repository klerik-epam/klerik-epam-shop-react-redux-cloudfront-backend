import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as path from 'path';

export class ProductServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const getProductsListLambda = new lambdaNodejs.NodejsFunction(this, 'GetProductsListLambda', {
      runtime: lambda.Runtime.NODEJS_20_X,
      entry: path.join(__dirname, '../lib/lambda/handlers/getProductsList.ts'),
      handler: 'main',
      bundling: {
        minify: true,
        target: 'es2020',
        sourceMap: false,
      },
    });

    const getProductByIdLambda = new lambdaNodejs.NodejsFunction(this, 'GetProductByIdLambda', {
        runtime: lambda.Runtime.NODEJS_20_X,
        entry: path.join(__dirname, '../lib/lambda/handlers/getProductById.ts'),
        handler: 'main',
        bundling: {
          minify: true,
          target: 'es2020',
          sourceMap: false,
        },
      }
    );

    const api = new apigateway.RestApi(this, 'ProductServiceApi', {
      restApiName: 'Product Service API',
      description: 'API for Product List (PLP)',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
      deployOptions: {
        stageName: 'dev'
      },
    });

    // GET /products/available
    const productsResource = api.root.addResource('product');
    const availableResource = productsResource.addResource('available');

    availableResource.addMethod(
      'GET',
      new apigateway.LambdaIntegration(getProductsListLambda),
      {
        methodResponses: [{ statusCode: '200' }]
      }
    );

    // GET /products/{productId}
    const productId = productsResource.addResource('{productId}');
    productId.addMethod(
      'GET',
      new apigateway.LambdaIntegration(getProductByIdLambda),
      {
        methodResponses: [
          { statusCode: '200' },
          { statusCode: '400' },
          { statusCode: '404' },
          { statusCode: '500' },
        ],
      }
    );

  }
}
