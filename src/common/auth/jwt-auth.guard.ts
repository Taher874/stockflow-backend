import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import type { UserRole } from './roles.decorator.js';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
}

export type AuthenticatedRequest = Request & { user: AuthenticatedUser };

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authorization = request.headers.authorization;
    const [scheme, token] = authorization?.split(' ') ?? [];

    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedException('A bearer token is required');
    }

    try {
      const payload = await this.jwtService.verifyAsync<{
        sub: string;
        email: string;
        role: UserRole;
      }>(token);

      if (
        typeof payload.sub !== 'string' ||
        typeof payload.email !== 'string' ||
        !['admin', 'user'].includes(payload.role)
      ) {
        throw new UnauthorizedException('Invalid access token');
      }

      request.user = {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
      };
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }
}
