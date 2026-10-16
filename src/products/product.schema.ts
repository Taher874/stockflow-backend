import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true, versionKey: false })
export class Product {
  createdAt!: Date;

  updatedAt!: Date;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, trim: true })
  category!: string;

  @Prop({ required: true, min: 0 })
  price!: number;

  @Prop({ required: true, min: 0, default: 0 })
  quantity!: number;

  @Prop({ required: true, min: 0, default: 0 })
  minStock!: number;
}

export type ProductDocument = HydratedDocument<Product>;
export const ProductSchema = SchemaFactory.createForClass(Product);
