import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';

export function createApi(
  scope: Construct,
  lambdas: {
    getProductsListLambda: apigateway.LambdaIntegration;
    getProductByIdLambda: apigateway.LambdaIntegration;
    openApiJsonLambda: apigateway.LambdaIntegration;
    swaggerUiLambda: apigateway.LambdaIntegration;
  }
) {
  const api = new apigateway.RestApi(scope, 'ProductServiceApi', {
    restApiName: 'Product Service API',
    description: 'API for Product List (PLP)',
    defaultCorsPreflightOptions: {
      allowOrigins: apigateway.Cors.ALL_ORIGINS,
      allowMethods: apigateway.Cors.ALL_METHODS
    },
    deployOptions: { stageName: 'dev' }
  });

  const productsResource = api.root.addResource('product');
  const availableResource = productsResource.addResource('available');

  availableResource.addMethod('GET', lambdas.getProductsListLambda, {
    methodResponses: [{ statusCode: '200' }]
  });

  const productId = productsResource.addResource('{productId}');
  productId.addMethod('GET', lambdas.getProductByIdLambda, {
    methodResponses: [
      { statusCode: '200' },
      { statusCode: '400' },
      { statusCode: '404' },
      { statusCode: '500' }
    ],
  });

  api.root.addResource('openapi.json').addMethod('GET', lambdas.openApiJsonLambda, {
    methodResponses: [{ statusCode: '200' }]
  });

  api.root.addResource('docs').addMethod('GET', lambdas.swaggerUiLambda, {
    methodResponses: [{ statusCode: '200' }]
  });
}
