import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { OrderModule } from "./module/order/order.module";
import awsConfig from "./config/aws.config";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [awsConfig],
      envFilePath: [".env.local", ".env"],
    }),
    OrderModule,
  ],
})
export class AppModule {}
