// МОК AWS SDK V3
jest.mock('@aws-sdk/client-dynamodb', () => ({
  DynamoDBClient: jest.fn().mockImplementation(() => ({
    send: jest.fn().mockResolvedValue({})
  })),
  PutItemCommand: jest.fn()
}));

jest.mock('@aws-sdk/client-sns', () => ({
  SNSClient: jest.fn().mockImplementation(() => ({
    send: jest.fn().mockResolvedValue({})
  })),
  PublishCommand: jest.fn()
}));

import { main as catalogBatchProcess} from "../../src/lambdas/products/catalogBatchProcess";

describe('catalogBatchProcess Lambda', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should process SQS messages and create products', async () => {
    const sqsEvent = {
      Records: [
        {
          body: JSON.stringify({
            id: '123',
            title: 'Test Product',
            description: 'Desc',
            price: 100,
          }),
        },
        {
          body: JSON.stringify({
            id: '456',
            title: 'Product 2',
            description: 'Another',
            price: 50,
          }),
        },
      ],
    };

    const result = await catalogBatchProcess(sqsEvent as any);

    expect(require('@aws-sdk/client-dynamodb').DynamoDBClient).toHaveBeenCalled();
    expect(require('@aws-sdk/client-sns').SNSClient).toHaveBeenCalled();
    expect(result).toEqual({ statusCode: 200, body: 'Batch processed' });
  });
});
