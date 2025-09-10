import { Module } from "@nestjs/common";
import { OrderController } from "./order.controller";
import { OrderService } from "./order.service";
import { DynamoDBService } from "./services/dynamodb.service";
import { ApiKeyService } from "./services/api-key.service";
import { ApiKeyGuard } from "./guards/api-key.guard";

@Module({
  imports: [],
  controllers: [OrderController],
  providers: [OrderService, DynamoDBService, ApiKeyService, ApiKeyGuard],
})
export class OrderModule {}
