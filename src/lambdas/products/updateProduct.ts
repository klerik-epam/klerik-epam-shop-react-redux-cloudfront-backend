import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient, TransactWriteItemsCommand } from '@aws-sdk/client-dynamodb';

const client = new DynamoDBClient({});
const PRODUCTS_TABLE = process.env.PRODUCTS_TABLE!;
const STOCK_TABLE = process.env.STOCK_TABLE!;

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,OPTIONS',
  'Content-Type': 'application/json',
};

export const main: APIGatewayProxyHandler = async (event) => {
  try {
    const productId = event.pathParameters?.productId;
    if (!productId) {
      return { statusCode: 400, headers: cors, body: JSON.stringify({ message: 'Missing productId in path' }) };
    }

    if (!event.body) {
      return { statusCode: 400, headers: cors, body: JSON.stringify({ message: 'Missing request body' }) };
    }

    const body = JSON.parse(event.body);
    const hasAll = body.title && body.description && body.price !== undefined && body.count !== undefined;
    if (!hasAll) {
      return { statusCode: 400, headers: cors, body: JSON.stringify({ message: 'title, price, count, description are required' }) };
    }

    const now = Date.now().toString();

    const cmd = new TransactWriteItemsCommand({
      TransactItems: [
        {
          Update: {
            TableName: PRODUCTS_TABLE,
            Key: { id: { S: productId } },
            UpdateExpression: 'SET title=:t, description=:d, price=:p, updatedAt=:u',
            ExpressionAttributeValues: {
              ':t': { S: String(body.title) },
              ':d': { S: String(body.description ?? '') },
              ':p': { N: Number(body.price).toString() },
              ':u': { N: now },
            },
            ConditionExpression: 'attribute_exists(id)',
          },
        },
        {
          Update: {
            TableName: STOCK_TABLE,
            Key: { product_id: { S: productId } },
            UpdateExpression: 'SET #count = :c',
            ExpressionAttributeNames: { '#count': 'count' },
            ExpressionAttributeValues: { ':c': { N: Number(body.count).toString() } },
            ConditionExpression: 'attribute_exists(product_id)',
          },
        }
      ],
    });

    await client.send(cmd);

    return {
      statusCode: 200,
      headers: cors,
      body: JSON.stringify({ message: 'Product updated', id: productId })
    };
  } catch (err: any) {
    console.error('Update product error:', err);
    if (err.name === 'ConditionalCheckFailedException') {
      return { statusCode: 404, headers: cors, body: JSON.stringify({ message: 'Product not found' }) };
    }
    return { statusCode: 500, headers: cors, body: JSON.stringify({ message: err.message }) };
  }
};
