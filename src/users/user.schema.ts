import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import type { UserRole } from '../common/auth/roles.decorator.js';

@Schema({ timestamps: true, versionKey: false })
export class User {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email!: string;

  @Prop({ required: true })
  passwordHash!: string;

  @Prop({
    type: String,
    required: true,
    enum: ['admin', 'user'],
    default: 'user',
  })
  role!: UserRole;
}

export type UserDocument = HydratedDocument<User>;
export const UserSchema = SchemaFactory.createForClass(User);
