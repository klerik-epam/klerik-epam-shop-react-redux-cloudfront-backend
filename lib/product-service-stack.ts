import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { createLambdas } from "./lambdas";
import { createApi } from "./api";
import { createDynamoTables } from "./dynamodb";

export class ProductServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 1. Таблиці

    const { productsTable, stockTable } = createDynamoTables(this);
    // 2. Lambda
    const lambdasRaw = createLambdas(this);

    // 3. Додаємо доступ для Lambda
    productsTable.grantReadData(lambdasRaw.getProductsListLambda);
    stockTable.grantReadData(lambdasRaw.getProductsListLambda);
    productsTable.grantReadData(lambdasRaw.getProductByIdLambda);
    stockTable.grantReadData(lambdasRaw.getProductByIdLambda);

    // Передати назви таблиць у Lambda
    lambdasRaw.getProductsListLambda.addEnvironment("PRODUCTS_TABLE", productsTable.tableName);
    lambdasRaw.getProductsListLambda.addEnvironment("STOCK_TABLE", stockTable.tableName);
    lambdasRaw.getProductByIdLambda.addEnvironment("PRODUCTS_TABLE", productsTable.tableName);
    lambdasRaw.getProductByIdLambda.addEnvironment("STOCK_TABLE", stockTable.tableName);

    // 4. API Gateway
    createApi(this, {
      getProductsListLambda: new apigateway.LambdaIntegration(lambdasRaw.getProductsListLambda),
      getProductByIdLambda: new apigateway.LambdaIntegration(lambdasRaw.getProductByIdLambda),
      openApiJsonLambda: new apigateway.LambdaIntegration(lambdasRaw.openApiJsonLambda),
      swaggerUiLambda: new apigateway.LambdaIntegration(lambdasRaw.swaggerUiLambda)
    });
  }
}
