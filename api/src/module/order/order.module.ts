import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { DynamoDBService } from './services/dynamodb.service';

@Module({
  imports: [],
  controllers: [OrderController],
  providers: [OrderService, DynamoDBService],
})
export class OrderModule {}