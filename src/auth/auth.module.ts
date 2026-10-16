import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'node:crypto';
import { User, UserSchema } from '../users/user.schema.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { JwtAuthGuard } from '../common/auth/jwt-auth.guard.js';
import { RolesGuard } from '../common/auth/roles.guard.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const secret = config.get<string>('JWT_SECRET');
        if (!secret && config.get<string>('NODE_ENV') === 'production') {
          throw new Error('JWT_SECRET must be set in production');
        }
        return {
          secret: secret ?? randomBytes(32).toString('hex'),
          signOptions: { expiresIn: '1h' },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard, RolesGuard],
  exports: [JwtModule],
})
export class AuthModule {}
