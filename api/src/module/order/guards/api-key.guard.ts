import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { ApiKeyService } from "../services/api-key.service";

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKey = this.extractApiKeyFromHeader(request);

    if (!apiKey) {
      throw new UnauthorizedException("API key is required");
    }

    if (!this.apiKeyService.validateApiKey(apiKey)) {
      throw new UnauthorizedException("Invalid API key");
    }

    return true;
  }

  private extractApiKeyFromHeader(request: any): string | null {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return null;
    }

    // Support both "Bearer <key>" and "ApiKey <key>" formats
    const bearerMatch = authHeader.match(/^Bearer\s+(.+)$/i);
    const apiKeyMatch = authHeader.match(/^ApiKey\s+(.+)$/i);

    return bearerMatch?.[1] || apiKeyMatch?.[1] || null;
  }
}
