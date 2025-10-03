import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { createProductsLambdas } from "../src/infrastructure/products/create-products-lambdas";
import { createProductServiceApi } from "../src/infrastructure/products/create-product-service-api";
import { createProductsTables } from "../src/dynamoDB/products/create-products-tables";

export class ProductServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const { productsTable, stockTable } = createProductsTables(this);
    const lambdasRaw = createProductsLambdas(this);

    // READ
    productsTable.grantReadData(lambdasRaw.getProductsListLambda);
    stockTable.grantReadData(lambdasRaw.getProductsListLambda);
    productsTable.grantReadData(lambdasRaw.getProductByIdLambda);
    stockTable.grantReadData(lambdasRaw.getProductByIdLambda);

    // WRITE (create + update)
    productsTable.grantWriteData(lambdasRaw.createProductLambda);
    stockTable.grantWriteData(lambdasRaw.createProductLambda);
    productsTable.grantWriteData(lambdasRaw.updateProductLambda);
    stockTable.grantWriteData(lambdasRaw.updateProductLambda);

    // ENV
    for (const fn of [
      lambdasRaw.getProductsListLambda,
      lambdasRaw.getProductByIdLambda,
      lambdasRaw.createProductLambda,
      lambdasRaw.updateProductLambda,
    ]) {
      fn.addEnvironment('PRODUCTS_TABLE', productsTable.tableName);
      fn.addEnvironment('STOCK_TABLE', stockTable.tableName);
    }

    createProductServiceApi(this, {
      getProductsListLambda: new apigateway.LambdaIntegration(lambdasRaw.getProductsListLambda),
      getProductByIdLambda: new apigateway.LambdaIntegration(lambdasRaw.getProductByIdLambda),
      createProductLambda: new apigateway.LambdaIntegration(lambdasRaw.createProductLambda),
      updateProductLambda: new apigateway.LambdaIntegration(lambdasRaw.updateProductLambda),
      openApiJsonLambda: new apigateway.LambdaIntegration(lambdasRaw.openApiJsonLambda),
      swaggerUiLambda: new apigateway.LambdaIntegration(lambdasRaw.swaggerUiLambda)
    });
  }
}
