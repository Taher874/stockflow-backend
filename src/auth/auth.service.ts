import {
  ConflictException,
  Injectable,
  Logger,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { compare, hash } from 'bcryptjs';
import { Model } from 'mongoose';
import type { UserRole } from '../common/auth/roles.decorator.js';
import { User, type UserDocument } from '../users/user.schema.js';
import type { LoginDto } from './dto/login.dto.js';
import type { RegisterDto } from './dto/register.dto.js';

export interface PublicUser {
  id: string;
  email: string;
  role: UserRole;
}

function isDuplicateKeyError(error: unknown): error is { code: number } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 11000
  );
}

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel(User.name) private readonly users: Model<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit(): Promise<void> {
    const email = this.configService.get<string>('BOOTSTRAP_ADMIN_EMAIL');
    const password = this.configService.get<string>('BOOTSTRAP_ADMIN_PASSWORD');

    if (!email && !password) {
      return;
    }
    if (!email || !password || password.length < 12) {
      throw new Error(
        'Set both BOOTSTRAP_ADMIN_EMAIL and BOOTSTRAP_ADMIN_PASSWORD; the password must be at least 12 characters.',
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingAdmin = await this.users.findOne({ email: normalizedEmail });
    if (existingAdmin && existingAdmin.role !== 'admin') {
      throw new Error(
        `BOOTSTRAP_ADMIN_EMAIL ${normalizedEmail} already belongs to a regular user`,
      );
    }
    if (!existingAdmin) {
      await this.users.create({
        email: normalizedEmail,
        passwordHash: await hash(password, 12),
        role: 'admin',
      });
      this.logger.log(`Bootstrapped administrator account for ${normalizedEmail}`);
    }
  }

  async register(dto: RegisterDto): Promise<{
    accessToken: string;
    user: PublicUser;
  }> {
    const existingUser = await this.users.exists({ email: dto.email });
    if (existingUser) {
      throw new ConflictException('An account with this email already exists');
    }

    try {
      const user = await this.users.create({
        email: dto.email,
        passwordHash: await hash(dto.password, 12),
        role: 'user',
      });
      return this.createSession(user);
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        throw new ConflictException('An account with this email already exists');
      }
      throw error;
    }
  }

  async login(dto: LoginDto): Promise<{
    accessToken: string;
    user: PublicUser;
  }> {
    const user = await this.users.findOne({ email: dto.email });
    if (!user || !(await compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return this.createSession(user);
  }

  async getPublicUser(id: string): Promise<PublicUser> {
    const user = await this.users.findById(id);
    if (!user) {
      throw new UnauthorizedException('Account no longer exists');
    }
    return this.toPublicUser(user);
  }

  private createSession(user: UserDocument): {
    accessToken: string;
    user: PublicUser;
  } {
    const publicUser = this.toPublicUser(user);
    const accessToken = this.jwtService.sign({
      sub: publicUser.id,
      email: publicUser.email,
      role: publicUser.role,
    });
    return { accessToken, user: publicUser };
  }

  private toPublicUser(user: UserDocument): PublicUser {
    return {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    };
  }
}
