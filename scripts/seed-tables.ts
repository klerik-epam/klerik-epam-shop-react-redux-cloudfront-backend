import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const REGION = process.env.AWS_REGION || "us-east-1";
const PRODUCTS_TABLE = "products";
const STOCK_TABLE = "stock";

const client = new DynamoDBClient({ region: REGION });
const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true,
    convertEmptyValues: true
  }
});

async function seed() {
  const { v4: uuidv4 } = await import('uuid');
  console.log("⏳ Починаю завантаження тестових даних...");

  const testProducts = [
    {
      id: uuidv4(),
      title: "iPhone 15 Pro",
      description: "Latest Apple flagship smartphone",
      price: 1200
    },
    {
      id: uuidv4(),
      title: "Samsung Galaxy S23",
      description: "Samsung's latest flagship phone",
      price: 999
    },
    {
      id: uuidv4(),
      title: "Google Pixel 8",
      description: "Pure Android experience from Google",
      price: 899
    }
  ];

  for (const product of testProducts) {
    // Products table
    await docClient.send(new PutCommand({
      TableName: PRODUCTS_TABLE,
      Item: product
    }));

    // Stock table
    await docClient.send(new PutCommand({
      TableName: STOCK_TABLE,
      Item: {
        product_id: product.id,
        count: Math.floor(Math.random() * 20) + 1
      }
    }));

    console.log(`✅ Додано товар: ${product.title}`);
  }

  console.log("🎉 Завантаження завершено");
}

seed().catch(err => {
  console.error("❌ Помилка при додаванні даних:", err);
  process.exit(1);
});
