import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './entities/order.entity';
import { DynamoDBService } from './services/dynamodb.service';

@Injectable()
export class OrderService {
  constructor(private readonly dynamoDBService: DynamoDBService) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const orderId = uuidv4();
    const now = new Date().toISOString();
    const order: Order = {
      id: orderId,
      pk: `ORDER#${orderId}`,
      sk: `ORDER#${orderId}`,
      ...createOrderDto,
      totalPrice: createOrderDto.quantity * createOrderDto.unitPrice,
      status: createOrderDto.status || 'pending',
      createdAt: now,
      updatedAt: now,
    };
    
    return await this.dynamoDBService.createOrder(order);
  }

  async findAll(): Promise<Order[]> {
    return await this.dynamoDBService.getAllOrders();
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.dynamoDBService.getOrder(id);
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return order;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
    // First check if order exists
    const existingOrder = await this.dynamoDBService.getOrder(id);
    if (!existingOrder) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    // Calculate new total price if quantity or unit price is being updated
    const updatedData: Partial<Order> = { ...updateOrderDto };
    if (updateOrderDto.quantity || updateOrderDto.unitPrice) {
      const newQuantity = updateOrderDto.quantity || existingOrder.quantity;
      const newUnitPrice = updateOrderDto.unitPrice || existingOrder.unitPrice;
      updatedData.totalPrice = newQuantity * newUnitPrice;
    }

    return await this.dynamoDBService.updateOrder(id, updatedData);
  }

  async remove(id: string): Promise<void> {
    // First check if order exists
    const existingOrder = await this.dynamoDBService.getOrder(id);
    if (!existingOrder) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    await this.dynamoDBService.deleteOrder(id);
  }

  getHello(): string {
    return 'Hello World from OrderService!';
  }
}
