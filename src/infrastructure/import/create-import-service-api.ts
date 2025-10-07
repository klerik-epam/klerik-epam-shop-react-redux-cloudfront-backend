import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';

export function createImportServiceApi(
  scope: Construct,
  lambdas: {
    importProductsFileLambda: apigateway.LambdaIntegration;
  }
) {
  const importServiceApi = new apigateway.RestApi(scope, 'ImportServiceApi', {
    restApiName: 'Import Service API',
    description: 'API for importing product files',
    defaultCorsPreflightOptions: {
      allowOrigins: apigateway.Cors.ALL_ORIGINS,
      allowMethods: apigateway.Cors.ALL_METHODS,
    },
    deployOptions: { stageName: 'dev' }
  });

  // GET /import
  const importResource = importServiceApi.root.addResource('import');

  importResource.addMethod('GET', lambdas.importProductsFileLambda, {
    methodResponses: [{ statusCode: '200' }]
  });
}
