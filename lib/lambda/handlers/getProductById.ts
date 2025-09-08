import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { products } from '../shared/products';

export const main = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const productId = event.pathParameters?.productId;

    if (!productId) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ message: 'Missing path parameter: productId' }),
      };
    }

    const product =
      products.find(p => p.id === productId);

    if (!product) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ message: `Product not found: ${productId}` }),
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(product),
    };
  } catch (err) {
    console.error('Error in getProductById:', err);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ message: 'Internal Server Error' }),
    };
  }
};
