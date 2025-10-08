// catalogBatchProcess.ts
import { SQSEvent } from 'aws-lambda';
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';

const dbClient = new DynamoDBClient({});
const snsClient = new SNSClient({});
const productsTable = process.env.PRODUCTS_TABLE!;
const snsTopicArn = process.env.SNS_TOPIC_ARN!;

export const main = async (event: SQSEvent) => {
  const { v4: uuidv4 } = await import('uuid');
  console.log('SQSEvent records count:', event.Records.length);

  for (const record of event.Records) {
    const product = JSON.parse(record.body);

    const id = product.id || uuidv4();

    console.log('Creating product:', product);

    await dbClient.send(new PutItemCommand({
      TableName: productsTable,
      Item: {
        id: { S: id },
        title: { S: product.title },
        description: { S: product.description },
        price: { N: product.price.toString() },
      }
    }));

    await snsClient.send(new PublishCommand({
      TopicArn: snsTopicArn,
      Message: JSON.stringify({ ...product, id }),
      Subject: 'New product created',
    }));
  }

  return { statusCode: 200, body: 'Batch processed' };
};
