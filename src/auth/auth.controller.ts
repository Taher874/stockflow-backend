import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { AuthenticatedUser } from '../common/auth/jwt-auth.guard.js';
import { CurrentUser } from '../common/auth/current-user.decorator.js';
import { JwtAuthGuard } from '../common/auth/jwt-auth.guard.js';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a regular user account' })
  @ApiBody({
    type: RegisterDto,
    examples: {
      register: {
        summary: 'Create a user account',
        value: {
          email: 'user@example.com',
          password: 'secure-password-123',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Account created and signed in',
    schema: {
      example: {
        accessToken: '<JWT access token>',
        user: {
          id: '665f1a2b3c4d5e6f78901234',
          email: 'user@example.com',
          role: 'user',
        },
      },
    },
  })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Sign in and receive an access token' })
  @ApiBody({
    type: LoginDto,
    examples: {
      login: {
        summary: 'Sign in with email and password',
        value: {
          email: 'admin@example.com',
          password: 'your-admin-password',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Signed in successfully',
    schema: {
      example: {
        accessToken: '<JWT access token>',
        user: {
          id: '665f1a2b3c4d5e6f78901234',
          email: 'admin@example.com',
          role: 'admin',
        },
      },
    },
  })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({ summary: 'Get the signed-in account' })
  @ApiResponse({
    status: 200,
    description: 'Current account details',
    schema: {
      example: {
        id: '665f1a2b3c4d5e6f78901234',
        email: 'admin@example.com',
        role: 'admin',
      },
    },
  })
  getCurrentUser(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.getPublicUser(user.id);
  }
}
