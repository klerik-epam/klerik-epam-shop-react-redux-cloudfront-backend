import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

export function createDynamoTables(scope: Construct) {
  const productsTable = new dynamodb.Table(scope, 'ProductsTable', {
    tableName: 'products',
    partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
    billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    removalPolicy: cdk.RemovalPolicy.DESTROY
  });

  const stockTable = new dynamodb.Table(scope, 'StockTable', {
    tableName: 'stock',
    partitionKey: { name: 'product_id', type: dynamodb.AttributeType.STRING },
    billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    removalPolicy: cdk.RemovalPolicy.DESTROY
  });

  return { productsTable, stockTable };
}
