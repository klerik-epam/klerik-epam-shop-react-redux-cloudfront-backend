import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { openapi } from '../../openapi/openapi';

export const main = async (
  _event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify(openapi),
  };
};
