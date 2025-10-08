import type { APIGatewayProxyEvent } from 'aws-lambda';
import { makeEvent } from '../test-utils/makeEvent';
import { main } from "../../src/lambdas/products/getProductById";

process.env.AWS_REGION = 'eu-central-1';

// МОК даних
jest.mock('../../src/lambdas/shared/products', () => ({
  products: [
    { id: "1", title: "Gold Ring with Diamond", description: "Elegant ring", price: 9500 },
    { id: "2", title: "Silver Bracelet with Cubic Zirconia", description: "Stylish bracelet", price: 1800 },
  ],
}));

describe('getProductById', () => {
  it('returns 400 when productId is missing', async () => {
    const event: APIGatewayProxyEvent = makeEvent({ pathParameters: null });
    const res = await main(event);

    expect(res.statusCode).toBe(400);
    expect(res.headers?.['Access-Control-Allow-Origin']).toBe('*');
  });

  it('returns 404 when product is not found', async () => {
    const event: APIGatewayProxyEvent = makeEvent({ pathParameters: { productId: '999' } });
    const res = await main(event);

    expect(res.statusCode).toBe(404);
    expect(res.headers?.['Content-Type']).toBe('application/json');
  });

  it('returns 200 and a single product when found', async () => {
    const event: APIGatewayProxyEvent = makeEvent({ pathParameters: { productId: '2' } });
    const res = await main(event);

    expect(res.statusCode).toBe(200);
    expect(res.headers?.['Access-Control-Allow-Origin']).toBe('*');
    expect(JSON.parse(res.body)).toMatchObject({ id: '2', title: 'Silver Bracelet with Cubic Zirconia' });
  });
});
