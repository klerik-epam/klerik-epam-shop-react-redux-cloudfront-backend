import { Handler } from 'aws-lambda';
import { DynamoDBClient, TransactWriteItemsCommand } from '@aws-sdk/client-dynamodb';

const client = new DynamoDBClient({});
const PRODUCTS_TABLE = process.env.PRODUCTS_TABLE!;
const STOCK_TABLE = process.env.STOCK_TABLE!;

const cors = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
};

export const main: Handler = async (event) => {
  const { v4: uuidv4 } = await import('uuid');
  console.log("Incoming request:", event);

  try {
    if (!event.body) {
      return { statusCode: 400, headers: cors, body: JSON.stringify({ message: 'Missing request body' }) };
    }

    const body = JSON.parse(event.body);

    if (!body.title || !body.price || !body.count || !body.description) {
      return { statusCode: 400, headers: cors, body: JSON.stringify({ message: 'title, price, count, description are required' }) };
    }

    const id = uuidv4();
    const createdAt = Date.now().toString();

    const command = new TransactWriteItemsCommand({
      TransactItems: [
        {
          Put: {
            TableName: PRODUCTS_TABLE,
            Item: {
              id: { S: id },
              title: { S: body.title },
              description: { S: body.description || '' },
              price: { N: body.price.toString() },
              createdAt: { N: createdAt }
            }
          }
        },
        {
          Put: {
            TableName: STOCK_TABLE,
            Item: {
              product_id: { S: id },
              count: { N: body.count.toString() }
            }
          }
        }
      ]
    });

    await client.send(command);

    return {
      statusCode: 201,
      headers: cors,
      body: JSON.stringify({ message: 'Product created successfully', id })
    };
  } catch (err) {
    console.error("Error creating product:", err);
    return { statusCode: 500, headers: cors, body: JSON.stringify({ message: 'Internal Server Error' }) };
  }
};
