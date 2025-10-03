import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';

const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const main = async (_event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const PRODUCTS_TABLE = process.env.PRODUCTS_TABLE!;
    const STOCK_TABLE = process.env.STOCK_TABLE!;

    const productsRes = await docClient.send(new ScanCommand({ TableName: PRODUCTS_TABLE }));
    const stockRes = await docClient.send(new ScanCommand({ TableName: STOCK_TABLE }));

    const products = productsRes.Items || [];
    const stock = stockRes.Items || [];

    const joined = products.map((p: any) => {
      const stockItem = stock.find((s: any) => s.product_id === p.id);
      return { ...p, count: stockItem ? stockItem.count : 0 };
    });

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(joined),
    };
  } catch (err) {
    console.error("Error in getProductsList:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
};
