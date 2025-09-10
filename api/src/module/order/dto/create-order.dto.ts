import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNumber, IsOptional, IsEmail, Min } from "class-validator";

export class CreateOrderDto {
  @ApiProperty({
    description: "Customer name",
    example: "John Doe",
  })
  @IsString()
  customerName: string;

  @ApiProperty({
    description: "Customer email",
    example: "john.doe@example.com",
  })
  @IsEmail()
  customerEmail: string;

  @ApiProperty({
    description: "Product name",
    example: "Wheelchair",
  })
  @IsString()
  productName: string;

  @ApiProperty({
    description: "Product quantity",
    example: 1,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({
    description: "Unit price",
    example: 100.99,
  })
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiProperty({
    description: "Order status",
    example: "pending",
    enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
    required: false,
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({
    description: "Shipping address",
    example: "123 Main St, City, State 12345",
    required: false,
  })
  @IsOptional()
  @IsString()
  shippingAddress?: string;
}
