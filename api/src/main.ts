import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle("Order API")
    .setDescription("API documentation for Order management system")
    .setVersion("1.0")
    .addTag("orders")
    .addApiKey(
      {
        type: "apiKey",
        name: "Authorization",
        in: "header",
        description:
          'API Key for authentication. Use format: "Bearer <your-api-key>" or "ApiKey <your-api-key>". Default for development: "Bearer test1234"',
      },
      "api-key"
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
