import * as cdk from 'aws-cdk-lib';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subs from 'aws-cdk-lib/aws-sns-subscriptions';
import * as lambdaEvents from 'aws-cdk-lib/aws-lambda-event-sources';
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

    /** ========== SQS ========== */
    const catalogItemsQueue = new sqs.Queue(this, 'CatalogItemsQueue', {
      queueName: 'catalogItemsQueue',
      visibilityTimeout: cdk.Duration.seconds(300)
    });

    /** ========== SNS ========== */
    const createProductTopic = new sns.Topic(this, 'CreateProductTopic', {
      displayName: 'Create Product Notifications'
    });

    createProductTopic.addSubscription(
      new subs.EmailSubscription('oleksii_kuznietsov@epam.com')
    );

    /** Прив'язка SQS до Lambda batch-процесу */
    lambdasRaw.catalogBatchProcessLambda.addEventSource(
      new lambdaEvents.SqsEventSource(catalogItemsQueue, {
        batchSize: 5
      })
    );

    // READ
    productsTable.grantReadData(lambdasRaw.getProductsListLambda);
    stockTable.grantReadData(lambdasRaw.getProductsListLambda);
    productsTable.grantReadData(lambdasRaw.getProductByIdLambda);
    stockTable.grantReadData(lambdasRaw.getProductByIdLambda);

    // WRITE (create + update)
    productsTable.grantWriteData(lambdasRaw.createProductLambda);
    productsTable.grantWriteData(lambdasRaw.catalogBatchProcessLambda);
    stockTable.grantWriteData(lambdasRaw.createProductLambda);
    stockTable.grantWriteData(lambdasRaw.catalogBatchProcessLambda);
    productsTable.grantWriteData(lambdasRaw.updateProductLambda);
    stockTable.grantWriteData(lambdasRaw.updateProductLambda);

    /** Дозволи на SQS та SNS */
    catalogItemsQueue.grantConsumeMessages(lambdasRaw.catalogBatchProcessLambda);
    createProductTopic.grantPublish(lambdasRaw.catalogBatchProcessLambda);

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

    /** ENV для batch-процесу */
    lambdasRaw.catalogBatchProcessLambda.addEnvironment('PRODUCTS_TABLE', productsTable.tableName);
    lambdasRaw.catalogBatchProcessLambda.addEnvironment('SNS_TOPIC_ARN', createProductTopic.topicArn);

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
