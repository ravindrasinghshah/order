import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  ScanCommand,
  UpdateCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { Order } from "../entities/order.entity";

@Injectable()
export class DynamoDBService {
  private readonly logger = new Logger(DynamoDBService.name);
  private readonly dynamoDBClient: DynamoDBDocumentClient;
  private readonly tableName: string;

  constructor(private configService: ConfigService) {
    const region = this.configService.get<string>("aws.region") || "us-east-2";
    const accessKeyId = this.configService.get<string>("aws.accessKeyId");
    const secretAccessKey = this.configService.get<string>(
      "aws.secretAccessKey"
    );
    const endpoint = this.configService.get<string>("aws.dynamoDB.endpoint");

    const clientConfig: any = {
      region,
    };

    if (accessKeyId && secretAccessKey) {
      clientConfig.credentials = {
        accessKeyId,
        secretAccessKey,
      };
    }

    if (endpoint) {
      clientConfig.endpoint = endpoint;
    }
    // console.log("clientConfig", clientConfig);
    const client = new DynamoDBClient(clientConfig);

    this.dynamoDBClient = DynamoDBDocumentClient.from(client);
    this.tableName =
      this.configService.get<string>("aws.dynamoDB.tableName") || "orders";
  }

  /**
   * Create an order in the database
   * @param order - The order to create
   * @returns The created order
   */
  async createOrder(order: Order): Promise<Order> {
    try {
      const orderWithKeys = {
        ...order,
        pk: `ORDER#${order.id}`,
        sk: `ORDER#${order.id}`,
      };
      console.log("createorder", orderWithKeys);
      await this.dynamoDBClient.send(
        new PutCommand({
          TableName: this.tableName,
          Item: orderWithKeys,
        })
      );

      this.logger.log(`Order ${order.id} created successfully`);
      return orderWithKeys;
    } catch (error) {
      this.logger.error(`Error creating order: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get an order from the database
   * @param id - The ID of the order to get
   * @returns The order
   */
  async getOrder(id: string): Promise<Order | null> {
    try {
      const result = await this.dynamoDBClient.send(
        new GetCommand({
          TableName: this.tableName,
          Key: {
            pk: `ORDER#${id}`,
            sk: `ORDER#${id}`,
          },
        })
      );

      if (!result.Item) {
        return null;
      }

      // Remove DynamoDB keys from response
      const { pk, sk, ...order } = result.Item as any;
      return order as Order;
    } catch (error) {
      this.logger.error(
        `Error getting order ${id}: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }

  /**
   * Get all orders from the database
   * @returns An array of orders
   */
  async getAllOrders(): Promise<Order[]> {
    try {
      const result = await this.dynamoDBClient.send(
        new ScanCommand({
          TableName: this.tableName,
          FilterExpression: "begins_with(pk, :pk)",
          ExpressionAttributeValues: {
            ":pk": "ORDER#",
          },
        })
      );

      return (result.Items || []).map((item) => {
        const { pk, sk, ...order } = item as any;
        return order as Order;
      });
    } catch (error) {
      this.logger.error(
        `Error getting all orders: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }

  /**
   * Update an order in the database
   * @param id - The ID of the order to update
   * @param updateData - The data to update the order with
   * @returns The updated order
   */
  async updateOrder(id: string, updateData: Partial<Order>): Promise<Order> {
    try {
      const updateExpression: string[] = [];
      const expressionAttributeNames: Record<string, string> = {};
      const expressionAttributeValues: Record<string, any> = {};

      // Build update expression dynamically
      Object.keys(updateData).forEach((key, index) => {
        if (key !== "id" && key !== "pk" && key !== "sk") {
          updateExpression.push(`#${key} = :val${index}`);
          expressionAttributeNames[`#${key}`] = key;
          expressionAttributeValues[`:val${index}`] = updateData[key];
        }
      });

      // Always update the updatedAt timestamp
      updateExpression.push("#updatedAt = :updatedAt");
      expressionAttributeNames["#updatedAt"] = "updatedAt";
      expressionAttributeValues[":updatedAt"] = new Date().toISOString();

      const result = await this.dynamoDBClient.send(
        new UpdateCommand({
          TableName: this.tableName,
          Key: {
            pk: `ORDER#${id}`,
            sk: `ORDER#${id}`,
          },
          UpdateExpression: `SET ${updateExpression.join(", ")}`,
          ExpressionAttributeNames: expressionAttributeNames,
          ExpressionAttributeValues: expressionAttributeValues,
          ReturnValues: "ALL_NEW",
        })
      );

      const { pk, sk, ...order } = result.Attributes as any;
      this.logger.log(`Order ${id} updated successfully`);
      return order as Order;
    } catch (error) {
      this.logger.error(
        `Error updating order ${id}: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }

  /**
   * Delete an order from the database
   * @param id - The ID of the order to delete
   * @returns void
   */
  async deleteOrder(id: string): Promise<void> {
    try {
      await this.dynamoDBClient.send(
        new DeleteCommand({
          TableName: this.tableName,
          Key: {
            pk: `ORDER#${id}`,
            sk: `ORDER#${id}`,
          },
        })
      );

      this.logger.log(`Order ${id} deleted successfully`);
    } catch (error) {
      this.logger.error(
        `Error deleting order ${id}: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }

  async createTable(): Promise<void> {
    // This method would be used to create the table if it doesn't exist
    // In production, you'd typically create tables via AWS CLI or CloudFormation
    this.logger.log(
      "Table creation should be handled via AWS CLI or CloudFormation"
    );
  }
}
