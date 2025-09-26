import type { APIGatewayProxyEvent } from 'aws-lambda';
import { makeEvent } from '../test-utils/makeEvent';
import { products } from "../../src/lambdas/shared/products";
import { main } from "../../src/lambdas/products/getProductsList";

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

describe('getProductsList', () => {
  it('returns 200 with full products list and CORS headers', async () => {
    const event: APIGatewayProxyEvent = makeEvent();

    const res = await main(event);

    expect(res.statusCode).toBe(200);
    expect(res.headers?.['Content-Type']).toBe('application/json');
    expect(res.headers?.['Access-Control-Allow-Origin']).toBe('*');

    const body = JSON.parse(res.body);
    expect(body).toEqual(products);
    expect(Array.isArray(body)).toBe(true);
    expect(body).toHaveLength(2);
  });
});
