import { ApiProperty } from "@nestjs/swagger";

export class Order {
  @ApiProperty({
    description: "Order ID",
    example: "1",
  })
  id: string;

  @ApiProperty({
    description: "Partition key for DynamoDB",
    example: "ORDER#1",
  })
  pk: string;

  @ApiProperty({
    description: "Sort key for DynamoDB",
    example: "ORDER#1",
  })
  sk: string;

  @ApiProperty({
    description: "Customer name",
    example: "John Doe",
  })
  customerName: string;

  @ApiProperty({
    description: "Customer email",
    example: "john.doe@example.com",
  })
  customerEmail: string;

  @ApiProperty({
    description: "Product name",
    example: "Laptop",
  })
  productName: string;

  @ApiProperty({
    description: "Product quantity",
    example: 2,
  })
  quantity: number;

  @ApiProperty({
    description: "Unit price",
    example: 999.99,
  })
  unitPrice: number;

  @ApiProperty({
    description: "Total price",
    example: 1999.98,
  })
  totalPrice: number;

  @ApiProperty({
    description: "Order status",
    example: "pending",
    enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
  })
  status: string;

  @ApiProperty({
    description: "Shipping address",
    example: "123 Main St, City, State 12345",
  })
  shippingAddress?: string;

  @ApiProperty({
    description: "Order creation date",
    example: "2024-01-15T10:30:45.123Z",
  })
  createdAt: string;

  @ApiProperty({
    description: "Order last update date",
    example: "2024-01-15T10:30:45.123Z",
  })
  updatedAt: string;

  @ApiProperty({
    description: "PDF file name",
    example: "order-receipt-123.pdf",
    required: false,
  })
  pdfFileName?: string;

  @ApiProperty({
    description: "PDF file path or URL",
    example: "/uploads/orders/order-receipt-123.pdf",
    required: false,
  })
  pdfFilePath?: string;

  @ApiProperty({
    description: "PDF file size in bytes",
    example: 1024000,
    required: false,
  })
  pdfFileSize?: number;
}
