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
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiSecurity,
  ApiConsumes,
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
    @Body(ValidationPipe) createOrderDto: CreateOrderDto
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
    @Body(ValidationPipe) updateOrderDto: UpdateOrderDto
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

  @Post("upload-pdf")
  @UseInterceptors(FileInterceptor("file"))
  @ApiOperation({ summary: "WIP: Upload PDF file" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    description: "PDF file to upload",
    type: "object",
    schema: {
      type: "object",
      properties: {
        file: {
          type: "string",
          format: "binary",
          description: "PDF file to upload",
        },
      },
      required: ["file"],
    },
  })
  @ApiResponse({
    status: 200,
    description: "File uploaded successfully",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: true },
        data: {
          type: "object",
          description: "Upload result data",
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "Bad request - No file uploaded or invalid file",
    schema: {
      type: "object",
      properties: {
        error: { type: "string", example: "No file uploaded" },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - Invalid or missing API key",
  })
  async uploadPdf(@UploadedFile() file: any) {
    if (!file) {
      return { error: "No file uploaded" };
    }
    const result = await this.orderService.uploadPdf(file);
    return {
      success: true,
      data: result,
    };
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
