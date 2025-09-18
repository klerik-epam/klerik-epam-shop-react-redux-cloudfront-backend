import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

// Проста HTML-сторінка з CDN swagger-ui
const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Product Service — Swagger UI</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet"
        href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css"/>
</head>
<body>
<div id="swagger-ui"></div>
<script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
<script>
  window.onload = () => {
    window.ui = SwaggerUIBundle({
      url: './openapi.json', // відносний шлях (працює зі stage префіксом)
      dom_id: '#swagger-ui',
      deepLinking: true
    });
  };
</script>
</body>
</html>`;

export const main = async (
  _event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => ({
  statusCode: 200,
  headers: {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-cache',
    'Access-Control-Allow-Origin': '*',
  },
  body: html,
});
