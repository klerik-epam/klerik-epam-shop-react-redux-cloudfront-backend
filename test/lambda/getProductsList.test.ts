import type { APIGatewayProxyEvent } from 'aws-lambda';
import { makeEvent } from '../test-utils/makeEvent';
import { products } from "../../src/lambdas/shared/products";
import { main } from "../../src/lambdas/products/getProductsList";

process.env.AWS_REGION = 'eu-central-1';

jest.mock('../../src/lambdas/shared/products', () => ({
  products: [
    { id: "1", title: "Gold Ring with Diamond", description: "Elegant ring", price: 9500 },
    { id: "2", title: "Silver Bracelet with Cubic Zirconia", description: "Stylish bracelet", price: 1800 },
  ],
}));

describe('getProductsList', () => {
  it('returns 200 with full products list and CORS headers', async () => {
    const event: APIGatewayProxyEvent = makeEvent();
    const res = await main(event);

    expect(res.statusCode).toBe(200);
    expect(res.headers?.['Access-Control-Allow-Origin']).toBe('*');
    expect(JSON.parse(res.body)).toEqual(products);
  });
});
