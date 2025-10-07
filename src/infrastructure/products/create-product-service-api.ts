import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';

export function createProductServiceApi(
  scope: Construct,
  lambdas: {
    getProductsListLambda: apigateway.LambdaIntegration;
    getProductByIdLambda: apigateway.LambdaIntegration;
    createProductLambda: apigateway.LambdaIntegration;
    updateProductLambda: apigateway.LambdaIntegration;
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

  // POST /product
  const productsResource = api.root.addResource('product');
  productsResource.addMethod('POST', lambdas.createProductLambda, {
    methodResponses: [
      { statusCode: '201' },
      { statusCode: '400' },
      { statusCode: '500' }
    ]
  });

  // GET /product/available
  const availableResource = productsResource.addResource('available');
  availableResource.addMethod('GET', lambdas.getProductsListLambda, {
    methodResponses: [{ statusCode: '200' }]
  });

  // GET /product/{productId}
  const productId = productsResource.addResource('{productId}');
  productId.addMethod('GET', lambdas.getProductByIdLambda, {
    methodResponses: [
      { statusCode: '200' },
      { statusCode: '400' },
      { statusCode: '404' },
      { statusCode: '500' }
    ],
  });

  // PUT /product/{productId}
  productId.addMethod('PUT', lambdas.updateProductLambda, {
    methodResponses: [
      { statusCode: '200' },
      { statusCode: '400' },
      { statusCode: '404' },
      { statusCode: '500' },
    ],
  });

  api.root.addResource('openapi.json').addMethod('GET', lambdas.openApiJsonLambda, {
    methodResponses: [{ statusCode: '200' }]
  });

  api.root.addResource('docs').addMethod('GET', lambdas.swaggerUiLambda, {
    methodResponses: [{ statusCode: '200' }]
  });
}
