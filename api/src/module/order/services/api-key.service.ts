import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class ApiKeyService {
  private readonly validApiKeys: Set<string>;

  constructor(private readonly configService: ConfigService) {
    // Get API keys from environment variables
    const apiKeys = this.configService.get<string>("ALLOWED_API_KEYS");
    this.validApiKeys = new Set(
      apiKeys ? apiKeys.split(",").map((key) => key.trim()) : [],
    );
  }

  validateApiKey(apiKey: string): boolean {
    return this.validApiKeys.has(apiKey);
  }

  getValidApiKeys(): string[] {
    return Array.from(this.validApiKeys);
  }
}
