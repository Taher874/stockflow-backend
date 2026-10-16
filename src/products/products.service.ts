import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { Product, type ProductDocument } from './product.schema.js';

export interface ProductResponse {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  minStock: number;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private readonly products: Model<Product>,
  ) {}

  async findAll(search?: string): Promise<ProductResponse[]> {
    const filter = search?.trim()
      ? {
          $or: [
            { name: { $regex: this.escapeRegex(search.trim()), $options: 'i' } },
            {
              category: {
                $regex: this.escapeRegex(search.trim()),
                $options: 'i',
              },
            },
          ],
        }
      : {};
    const products = await this.products.find(filter).sort({ name: 1 }).exec();
    return products.map((product) => this.toResponse(product));
  }

  async create(dto: CreateProductDto): Promise<ProductResponse> {
    const product = await this.products.create(dto);
    return this.toResponse(product);
  }

  async update(id: string, dto: UpdateProductDto): Promise<ProductResponse> {
    const product = await this.products
      .findByIdAndUpdate(this.requireObjectId(id), dto, {
        new: true,
        runValidators: true,
      })
      .exec();
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return this.toResponse(product);
  }

  async remove(id: string): Promise<{ deleted: true }> {
    const product = await this.products
      .findByIdAndDelete(this.requireObjectId(id))
      .exec();
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return { deleted: true };
  }

  async getDashboard() {
    const products = await this.products.find().sort({ name: 1 }).exec();
    const lowStockProducts = products.filter(
      (product) => product.quantity <= product.minStock,
    );
    return {
      totalProducts: products.length,
      totalStock: products.reduce((total, product) => total + product.quantity, 0),
      lowStockCount: lowStockProducts.length,
      lowStockProducts: lowStockProducts.map((product) =>
        this.toResponse(product),
      ),
    };
  }

  private requireObjectId(id: string) {
    if (!isValidObjectId(id)) {
      throw new NotFoundException('Product not found');
    }
    return id;
  }

  private escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private toResponse(product: ProductDocument): ProductResponse {
    return {
      id: product._id.toString(),
      name: product.name,
      category: product.category,
      price: product.price,
      quantity: product.quantity,
      minStock: product.minStock,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}
