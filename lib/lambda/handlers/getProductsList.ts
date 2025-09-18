import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { products } from '../shared/products';

export const main = async (
  _event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(products)
    };
  } catch (err) {
    console.error("Error in getProductsList:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error" })
    };
  }
};
