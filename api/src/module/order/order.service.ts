import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderDto } from "./dto/update-order.dto";
import { Order } from "./entities/order.entity";
import { DynamoDBService } from "./services/dynamodb.service";
import * as pdfParse from "pdf-parse";

import * as Tesseract from "tesseract.js";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";

@Injectable()
export class OrderService {
  private model: ChatOpenAI;
  constructor(private readonly dynamoDBService: DynamoDBService) {
    this.model = new ChatOpenAI({
      model: "gpt-4o-mini",
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const orderId = uuidv4();
    const now = new Date().toISOString();
    const order: Order = {
      id: orderId,
      pk: `ORDER#${orderId}`,
      sk: `ORDER#${orderId}`,
      ...createOrderDto,
      totalPrice: createOrderDto.quantity * createOrderDto.unitPrice,
      status: createOrderDto.status || "pending",
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

  async uploadPdf(file: any): Promise<string> {
    let text = "";
    // Validate file type
    if (file.mimetype !== "application/pdf") {
      throw new BadRequestException("Only PDF files are allowed");
    }

    // Step 1: try digital text
    try {
      const pdfData = await pdfParse(file.buffer);
      text = pdfData.text.trim();
    } catch {
      console.warn("PDF parse failed, will try OCR...");
    }

    // Step 2: OCR fallback
    if (!text) {
      const {
        data: { text: ocrText },
      } = await Tesseract.recognize(file.buffer, "eng");
      text = ocrText;
    }

    // Step 3: LangChain prompt
    const prompt = PromptTemplate.fromTemplate(`
  You are a medical document parser. 
  Extract ONLY the following fields from the text:
  - Patient Name
  - Date of Birth (MM/DD/YYYY)

  If not found, return null for that field.

  Text:
  {doc_text}
`);

    const chain = prompt.pipe(this.model);

    const response = await chain.invoke({ doc_text: text });
    //== TODO: parse the response to JSON using ZodSchema
    return response.toString();
  }
}
