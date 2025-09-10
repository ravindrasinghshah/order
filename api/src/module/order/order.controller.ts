import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ValidationPipe,
  UseGuards,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiSecurity,
} from "@nestjs/swagger";
import { OrderService } from "./order.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderDto } from "./dto/update-order.dto";
import { Order } from "./entities/order.entity";
import { ApiKeyGuard } from "./guards/api-key.guard";

@ApiTags("orders")
@Controller("orders")
@UseGuards(ApiKeyGuard)
@ApiSecurity("api-key")
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @ApiOperation({ summary: "Create a new order" })
  @ApiBody({ type: CreateOrderDto })
  @ApiResponse({
    status: 201,
    description: "Order created successfully",
    type: Order,
  })
  @ApiResponse({
    status: 400,
    description: "Bad request - validation failed",
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - Invalid or missing API key",
  })
  async create(
    @Body(ValidationPipe) createOrderDto: CreateOrderDto,
  ): Promise<Order> {
    return await this.orderService.create(createOrderDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all orders" })
  @ApiResponse({
    status: 200,
    description: "Returns all orders",
    type: [Order],
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - Invalid or missing API key",
  })
  async findAll(): Promise<Order[]> {
    return await this.orderService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get order by ID" })
  @ApiParam({ name: "id", description: "Order ID" })
  @ApiResponse({
    status: 200,
    description: "Returns the order",
    type: Order,
  })
  @ApiResponse({
    status: 404,
    description: "Order not found",
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - Invalid or missing API key",
  })
  async findOne(@Param("id") id: string): Promise<Order> {
    return await this.orderService.findOne(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update order by ID" })
  @ApiParam({ name: "id", description: "Order ID" })
  @ApiBody({ type: UpdateOrderDto })
  @ApiResponse({
    status: 200,
    description: "Order updated successfully",
    type: Order,
  })
  @ApiResponse({
    status: 404,
    description: "Order not found",
  })
  @ApiResponse({
    status: 400,
    description: "Bad request - validation failed",
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - Invalid or missing API key",
  })
  async update(
    @Param("id") id: string,
    @Body(ValidationPipe) updateOrderDto: UpdateOrderDto,
  ): Promise<Order> {
    return await this.orderService.update(id, updateOrderDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete order by ID" })
  @ApiParam({ name: "id", description: "Order ID" })
  @ApiResponse({
    status: 200,
    description: "Order deleted successfully",
  })
  @ApiResponse({
    status: 404,
    description: "Order not found",
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - Invalid or missing API key",
  })
  async remove(@Param("id") id: string): Promise<void> {
    return await this.orderService.remove(id);
  }

  @Get("health/check")
  @ApiOperation({ summary: "Health check endpoint" })
  @ApiResponse({
    status: 200,
    description: "Returns the health status of the API",
    schema: {
      type: "object",
      properties: {
        status: { type: "string", example: "OK" },
        timestamp: { type: "string", example: "2024-01-15T10:30:45.123Z" },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - Invalid or missing API key",
  })
  getHealth(): { status: string; timestamp: string } {
    return {
      status: "OK",
      timestamp: new Date().toISOString(),
    };
  }
}
