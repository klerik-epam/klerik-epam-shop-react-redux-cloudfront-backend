// lambdas/import/importFileParser.ts
import { Handler, S3Event } from 'aws-lambda';
import {
  S3Client,
  GetObjectCommand,
  CopyObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import csv from 'csv-parser';
import { Readable } from 'stream';

const s3Client = new S3Client({});
const bucketName = process.env.BUCKET_NAME!;
const UPLOADED_PREFIX = 'uploaded/';
const PARSED_PREFIX = 'parsed/';

const makeCopySource = (bucket: string, key: string) =>
  `${bucket}/${encodeURIComponent(key)}`;


function parseCsvStream(stream: Readable): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    stream
      .pipe(csv())
      .on('data', (row) => {
        console.log('Parsed row:', row);
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

      await parseCsvStream(bodyStream);
      console.log(`CSV file ${key} successfully processed.`);

      const parsedKey = key.replace(/^uploaded\//, PARSED_PREFIX);
      await s3Client.send(
        new CopyObjectCommand({
          Bucket: bucketName,
          CopySource: makeCopySource(bucketName, key),
          Key: parsedKey,
        })
      );
      console.log(`Copied to ${parsedKey}`);

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
