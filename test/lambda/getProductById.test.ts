import type { APIGatewayProxyEvent } from 'aws-lambda';
import { makeEvent } from '../test-utils/makeEvent';
import { main } from "../../src/lambdas/products/getProductById";

jest.mock('../../src/lambdas/shared/products', () => ({
  products: [
    {
      id: "1",
      title: "Gold Ring with Diamond",
      description: "Elegant 14K gold ring featuring a 0.5 carat natural diamond. A timeless choice for special occasions.",
      price: 9500
    },
    {
      id: "2",
      title: "Silver Bracelet with Cubic Zirconia",
      description: "Lightweight and stylish sterling silver bracelet with cubic zirconia stones.",
      price: 1800
    },
  ],
}));

describe('getProductById', () => {
  it('returns 400 when productId is missing', async () => {
    const event: APIGatewayProxyEvent = makeEvent({ pathParameters: null });

    const res = await main(event);

    expect(res.statusCode).toBe(400);
    const body = JSON.parse(res.body);
    expect(body).toEqual({ message: 'Missing path parameter: productId' });
    expect(res.headers?.['Access-Control-Allow-Origin']).toBe('*');
  });

  it('returns 404 when product is not found', async () => {
    const event: APIGatewayProxyEvent = makeEvent({ pathParameters: { productId: '999' } });

    const res = await main(event);

    expect(res.statusCode).toBe(404);
    const body = JSON.parse(res.body);
    expect(body.message).toMatch(/Product not found: 999/);
    expect(res.headers?.['Content-Type']).toBe('application/json');
  });

  it('returns 200 and a single product when found', async () => {
    const event: APIGatewayProxyEvent = makeEvent({ pathParameters: { productId: '2' } });

    const res = await main(event);

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body).toMatchObject({ id: '2', title: 'Silver Bracelet with Cubic Zirconia' });
    expect(res.headers?.['Content-Type']).toBe('application/json');
    expect(res.headers?.['Access-Control-Allow-Origin']).toBe('*');
  });
});
