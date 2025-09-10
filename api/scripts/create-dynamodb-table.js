const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { CreateTableCommand } = require('@aws-sdk/client-dynamodb');

// Configuration
const config = {
  region: process.env.AWS_REGION || 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  tableName: process.env.DYNAMODB_TABLE_NAME || 'orders',
  endpoint: process.env.DYNAMODB_ENDPOINT, // For local development
};

// Create DynamoDB client
const client = new DynamoDBClient({
  region: config.region,
  credentials: {
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
  },
  ...(config.endpoint && { endpoint: config.endpoint }),
});

// Table schema
const tableParams = {
  TableName: config.tableName,
  KeySchema: [
    {
      AttributeName: 'pk',
      KeyType: 'HASH', // Partition key
    },
    {
      AttributeName: 'sk',
      KeyType: 'RANGE', // Sort key
    },
  ],
  AttributeDefinitions: [
    {
      AttributeName: 'pk',
      AttributeType: 'S',
    },
    {
      AttributeName: 'sk',
      AttributeType: 'S',
    },
  ],
  BillingMode: 'PAY_PER_REQUEST', // On-demand billing
  GlobalSecondaryIndexes: [
    {
      IndexName: 'OrderIdIndex',
      KeySchema: [
        {
          AttributeName: 'id',
          KeyType: 'HASH',
        },
      ],
      Projection: {
        ProjectionType: 'ALL',
      },
    },
  ],
};

// Add the id attribute definition for the GSI
tableParams.AttributeDefinitions.push({
  AttributeName: 'id',
  AttributeType: 'S',
});

async function createTable() {
  try {
    console.log(`Creating table ${config.tableName}...`);
    
    const command = new CreateTableCommand(tableParams);
    const result = await client.send(command);
    
    console.log('Table created successfully:', result);
    console.log('Table ARN:', result.TableDescription.TableArn);
    console.log('Table status:', result.TableDescription.TableStatus);
    
    // Wait for table to be active
    console.log('Waiting for table to become active...');
    await waitForTableActive(config.tableName);
    console.log('Table is now active and ready to use!');
    
  } catch (error) {
    if (error.name === 'ResourceInUseException') {
      console.log(`Table ${config.tableName} already exists.`);
    } else {
      console.error('Error creating table:', error);
      process.exit(1);
    }
  }
}

async function waitForTableActive(tableName) {
  const { DescribeTableCommand } = require('@aws-sdk/client-dynamodb');
  
  while (true) {
    try {
      const command = new DescribeTableCommand({ TableName: tableName });
      const result = await client.send(command);
      
      if (result.Table.TableStatus === 'ACTIVE') {
        return;
      }
      
      console.log(`Table status: ${result.Table.TableStatus}, waiting...`);
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
    } catch (error) {
      console.error('Error checking table status:', error);
      throw error;
    }
  }
}

// Run the script
createTable().catch(console.error);
