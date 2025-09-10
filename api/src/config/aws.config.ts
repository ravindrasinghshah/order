import { registerAs } from '@nestjs/config';

export default registerAs('aws', () => ({
  region: process.env.AWS_REGION || 'us-east-2',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  dynamoDB: {
    tableName: process.env.DYNAMODB_TABLE_NAME || 'orders',
    endpoint: process.env.DYNAMODB_ENDPOINT || undefined, // Only for local development (e.g., http://localhost:8000)
  },
}));