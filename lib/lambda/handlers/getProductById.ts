import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';

const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const main = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const productId = event.pathParameters?.productId;
    if (!productId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Missing path parameter: productId' })
      };
    }

    const PRODUCTS_TABLE = process.env.PRODUCTS_TABLE!;
    const STOCK_TABLE = process.env.STOCK_TABLE!;

    const productRes = await docClient.send(new GetCommand({
      TableName: PRODUCTS_TABLE,
      Key: { id: productId }
    }));

    if (!productRes.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: `Product not found: ${productId}` })
      };
    }

    const stockRes = await docClient.send(new GetCommand({
      TableName: STOCK_TABLE,
      Key: { product_id: productId }
    }));

    const result = {
      ...productRes.Item,
      count: stockRes.Item ? stockRes.Item.count : 0
    };

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(result)
    };

  } catch (err) {
    console.error("Error in getProductById:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error" })
    };
  }
};
