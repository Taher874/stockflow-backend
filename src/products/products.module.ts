import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module.js';
import { Product, ProductSchema } from './product.schema.js';
import { ProductsController } from './products.controller.js';
import { ProductsService } from './products.service.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    AuthModule,
    
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
