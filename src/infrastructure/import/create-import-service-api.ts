import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';

export function createImportServiceApi(
  scope: Construct,
  lambdas: {
    importProductsFileLambda: apigateway.LambdaIntegration;
    authorizer: apigateway.IAuthorizer;
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

  const importResource = importServiceApi.root.addResource('import');

  importResource.addMethod('GET', lambdas.importProductsFileLambda, {
    methodResponses: [{ statusCode: '200' }],
    authorizer: lambdas.authorizer,
    authorizationType: apigateway.AuthorizationType.CUSTOM,
  });
}
