import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { createLambdas } from "./lambdas";
import { createApi } from "./api";
import { createDynamoTables } from "./dynamodb";

export class ProductServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const { productsTable, stockTable } = createDynamoTables(this);
    const lambdasRaw = createLambdas(this);

    // --- Read Access ---
    productsTable.grantReadData(lambdasRaw.getProductsListLambda);
    stockTable.grantReadData(lambdasRaw.getProductsListLambda);

    productsTable.grantReadData(lambdasRaw.getProductByIdLambda);
    stockTable.grantReadData(lambdasRaw.getProductByIdLambda);

    // --- Write Access for CreateProduct ---
    productsTable.grantWriteData(lambdasRaw.createProductLambda);
    stockTable.grantWriteData(lambdasRaw.createProductLambda);

    // --- Env variables ---
    lambdasRaw.getProductsListLambda.addEnvironment("PRODUCTS_TABLE", productsTable.tableName);
    lambdasRaw.getProductsListLambda.addEnvironment("STOCK_TABLE", stockTable.tableName);

    lambdasRaw.getProductByIdLambda.addEnvironment("PRODUCTS_TABLE", productsTable.tableName);
    lambdasRaw.getProductByIdLambda.addEnvironment("STOCK_TABLE", stockTable.tableName);

    lambdasRaw.createProductLambda.addEnvironment('PRODUCTS_TABLE', productsTable.tableName);
    lambdasRaw.createProductLambda.addEnvironment('STOCK_TABLE', stockTable.tableName);

    // --- API Gateway ---
    createApi(this, {
      getProductsListLambda: new apigateway.LambdaIntegration(lambdasRaw.getProductsListLambda),
      getProductByIdLambda: new apigateway.LambdaIntegration(lambdasRaw.getProductByIdLambda),
      createProductLambda: new apigateway.LambdaIntegration(lambdasRaw.createProductLambda),
      openApiJsonLambda: new apigateway.LambdaIntegration(lambdasRaw.openApiJsonLambda),
      swaggerUiLambda: new apigateway.LambdaIntegration(lambdasRaw.swaggerUiLambda)
    });
  }
}
