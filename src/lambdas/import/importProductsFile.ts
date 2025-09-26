import { APIGatewayProxyHandler } from 'aws-lambda';
import { S3Client, PutObjectCommand, PutObjectCommandInput } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({});
const bucketName = process.env.BUCKET_NAME!;
const UPLOADED_PREFIX = 'uploaded/';
const DEFAULT_EXPIRES = 3600;
const FILENAME_REGEX = /^[A-Za-z0-9._-]+$/;

export const main: APIGatewayProxyHandler = async (event) => {
  console.log('Incoming request:', JSON.stringify(event));

  try {
    const fileName = event.queryStringParameters?.name?.trim();
    const contentTypeFromQuery = event.queryStringParameters?.contentType?.trim();

    if (!fileName) {
      return response(400, { message: 'Missing query parameter "name"' });
    }

    if (!FILENAME_REGEX.test(fileName)) {
      return response(400, {
        message:
          'Invalid file name. Allowed characters: letters, numbers, dot (.), underscore (_), dash (-).',
      });
    }

    const key = `${UPLOADED_PREFIX}${fileName}`;

    const contentType = contentTypeFromQuery || 'text/csv';

    const putParams: PutObjectCommandInput = {
      Bucket: bucketName,
      Key: key,
      ContentType: contentType,
    };

    const command = new PutObjectCommand(putParams);
    const url = await getSignedUrl(s3Client, command, { expiresIn: DEFAULT_EXPIRES });

    return response(200, {
      url,
      bucket: bucketName,
      key,
      method: 'PUT',
      expiresIn: DEFAULT_EXPIRES,
      requiredHeaders: { 'Content-Type': contentType },
    });
  } catch (err) {
    console.error('Error generating signed URL:', err);
    return response(500, { message: 'Internal Server Error' });
  }
};

function response(statusCode: number, body: Record<string, unknown>) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Allow-Methods': 'GET,OPTIONS',
    },
    body: JSON.stringify(body),
  };
}
