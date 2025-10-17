// lambdas/import/importFileParser.ts
import { Handler, S3Event } from 'aws-lambda';
import {
  S3Client,
  GetObjectCommand,
  CopyObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import csv from 'csv-parser';
import { Readable } from 'stream';

const s3Client = new S3Client({});
const sqsClient = new SQSClient({});

const bucketName = process.env.BUCKET_NAME!;
const sqsUrl = process.env.SQS_URL!;

const UPLOADED_PREFIX = 'uploaded/';
const PARSED_PREFIX = 'parsed/';

const makeCopySource = (bucket: string, key: string) =>
  `${bucket}/${encodeURIComponent(key)}`;

function parseCsvStreamAndSendToSqs(stream: Readable): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    stream
      .pipe(csv())
      .on('data', async (row) => {
        try {
          console.log('Sending parsed row to SQS:', row);
          await sqsClient.send(
            new SendMessageCommand({
              QueueUrl: sqsUrl,
              MessageBody: JSON.stringify(row),
            })
          );
        } catch (err) {
          console.error('Failed to send message to SQS:', err);
        }
      })
      .on('end', () => {
        resolve();
      })
      .on('error', (err) => {
        reject(err);
      });
  });
}

export const main: Handler = async (event: S3Event) => {
  console.log('S3 Event:', JSON.stringify(event));

  for (const record of event.Records ?? []) {
    const key = record.s3.object.key;

    if (!key.startsWith(UPLOADED_PREFIX)) {
      console.log(`Skip object with key: ${key} (no ${UPLOADED_PREFIX} prefix)`);
      continue;
    }

    try {
      const getRes = await s3Client.send(
        new GetObjectCommand({ Bucket: bucketName, Key: key })
      );

      const bodyStream = getRes.Body as Readable;
      if (!bodyStream) {
        console.warn(`Empty Body for key: ${key}`);
        continue;
      }

      // ✅ Parse CSV and send each row to SQS
      await parseCsvStreamAndSendToSqs(bodyStream);
      console.log(`CSV file ${key} successfully processed and sent to SQS.`);

      // Copy to "parsed" folder
      const parsedKey = key.replace(/^uploaded\//, PARSED_PREFIX);
      await s3Client.send(
        new CopyObjectCommand({
          Bucket: bucketName,
          CopySource: makeCopySource(bucketName, key),
          Key: parsedKey,
        })
      );
      console.log(`Copied to ${parsedKey}`);

      // Delete original
      await s3Client.send(
        new DeleteObjectCommand({ Bucket: bucketName, Key: key })
      );
      console.log(`Deleted original ${key}`);
    } catch (err) {
      console.error(`Error processing ${key}:`, err);
    }
  }

  return { statusCode: 200, body: 'OK' };
};
