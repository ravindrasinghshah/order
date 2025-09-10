# AWS Database Integration for Order API

This document describes the AWS DynamoDB integration for the Order API service.

## Overview

The Order API has been updated to use AWS DynamoDB for persistent data storage instead of in-memory storage. This provides:

- **Scalability**: DynamoDB automatically scales based on demand
- **Durability**: Data is replicated across multiple availability zones
- **Performance**: Single-digit millisecond latency
- **Serverless**: No server management required

## Architecture

### Database Schema

The DynamoDB table uses a single-table design with the following structure:

- **Partition Key (pk)**: `ORDER#{id}` - Used for efficient querying
- **Sort Key (sk)**: `ORDER#{id}` - Allows for future expansion
- **Global Secondary Index**: `OrderIdIndex` on the `id` field for direct lookups

### Key Components

1. **DynamoDBService** (`src/module/order/services/dynamodb.service.ts`)
   - Handles all DynamoDB operations
   - Provides CRUD operations for orders
   - Includes error handling and logging

2. **Updated OrderService** (`src/module/order/order.service.ts`)
   - Now uses DynamoDBService instead of in-memory storage
   - All methods are now async
   - Uses UUID for order IDs

3. **AWS Configuration** (`src/config/aws.config.ts`)
   - Centralized AWS configuration
   - Environment-based settings
   - Support for local development

## Setup Instructions

### 1. Install Dependencies

```bash
cd api
npm install
```

### 2. Environment Configuration

Create a `.env` file in the `api` directory:

```bash
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here

# DynamoDB Configuration
DYNAMODB_TABLE_NAME=orders

# For local development with DynamoDB Local
# DYNAMODB_ENDPOINT=http://localhost:8000

# Application Configuration
NODE_ENV=development
PORT=3000
```

### 3. AWS Credentials

Set up AWS credentials using one of these methods:

#### Option A: AWS CLI
```bash
aws configure
```

#### Option B: Environment Variables
```bash
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_REGION=us-east-1
```

#### Option C: IAM Roles (Recommended for Production)
Attach an IAM role with DynamoDB permissions to your EC2 instance or Lambda function.

### 4. Create DynamoDB Table

#### Using AWS CLI
```bash
aws dynamodb create-table \
    --table-name orders \
    --attribute-definitions \
        AttributeName=pk,AttributeType=S \
        AttributeName=sk,AttributeType=S \
        AttributeName=id,AttributeType=S \
    --key-schema \
        AttributeName=pk,KeyType=HASH \
        AttributeName=sk,KeyType=RANGE \
    --global-secondary-indexes \
        IndexName=OrderIdIndex,KeySchema=[{AttributeName=id,KeyType=HASH}],Projection={ProjectionType=ALL} \
    --billing-mode PAY_PER_REQUEST
```

#### Using the Setup Script
```bash
cd api/scripts
npm install
npm run create-table
```

For local development:
```bash
npm run create-table:local
```

### 5. Required IAM Permissions

Your AWS credentials need the following DynamoDB permissions:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "dynamodb:PutItem",
                "dynamodb:GetItem",
                "dynamodb:UpdateItem",
                "dynamodb:DeleteItem",
                "dynamodb:Scan",
                "dynamodb:Query"
            ],
            "Resource": [
                "arn:aws:dynamodb:us-east-1:YOUR_ACCOUNT_ID:table/orders",
                "arn:aws:dynamodb:us-east-1:YOUR_ACCOUNT_ID:table/orders/index/*"
            ]
        }
    ]
}
```

## Local Development

### Using DynamoDB Local

1. Install DynamoDB Local:
```bash
# Using Docker
docker run -p 8000:8000 amazon/dynamodb-local

# Or download and run locally
# Download from: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html
```

2. Update your `.env` file:
```bash
DYNAMODB_ENDPOINT=http://localhost:8000
```

3. Create the table:
```bash
cd api/scripts
npm run create-table:local
```

## API Endpoints

All endpoints remain the same, but now use persistent storage:

- `POST /orders` - Create a new order
- `GET /orders` - Get all orders
- `GET /orders/:id` - Get order by ID
- `PATCH /orders/:id` - Update order
- `DELETE /orders/:id` - Delete order
- `GET /orders/health/check` - Health check

## Data Model

### Order Entity

```typescript
{
  id: string;           // UUID
  pk: string;           // DynamoDB partition key (ORDER#{id})
  sk: string;           // DynamoDB sort key (ORDER#{id})
  customerName: string;
  customerEmail: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status: string;
  shippingAddress?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## Error Handling

The service includes comprehensive error handling:

- **Validation errors**: Invalid input data
- **Not found errors**: Order doesn't exist
- **AWS errors**: DynamoDB connection issues
- **Logging**: All operations are logged for debugging

## Monitoring and Logging

- All database operations are logged with appropriate levels
- Error messages include stack traces for debugging
- Success operations are logged for audit trails

## Production Considerations

1. **Security**: Use IAM roles instead of access keys
2. **Monitoring**: Set up CloudWatch alarms for DynamoDB metrics
3. **Backup**: Enable point-in-time recovery
4. **Scaling**: Monitor read/write capacity usage
5. **Cost**: Monitor DynamoDB costs and set up billing alerts

## Troubleshooting

### Common Issues

1. **Access Denied**: Check IAM permissions
2. **Table Not Found**: Ensure table is created before running the app
3. **Connection Issues**: Verify AWS credentials and region
4. **Local Development**: Ensure DynamoDB Local is running

### Debug Mode

Enable debug logging by setting:
```bash
NODE_ENV=development
```

This will provide detailed logs of all DynamoDB operations.
