import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/auth/jwt-auth.guard.js';
import { Roles } from '../common/auth/roles.decorator.js';
import { RolesGuard } from '../common/auth/roles.guard.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { ProductsService } from './products.service.js';

@Controller()
@ApiBearerAuth()
@ApiTags('Inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('products')
  @ApiOperation({ summary: 'List inventory products' })
  @ApiQuery({
    name: 'search',
    required: false,
    example: 'stationery',
    description: 'Search product names and categories',
  })
  @ApiResponse({
    status: 200,
    description: 'Products sorted by name',
    schema: {
      example: [
        {
          id: '665f1a2b3c4d5e6f78901234',
          name: 'Notebook',
          category: 'Stationery',
          price: 50,
          quantity: 25,
          minStock: 10,
          createdAt: '2026-10-16T07:00:00.000Z',
          updatedAt: '2026-10-16T07:00:00.000Z',
        },
      ],
    },
  })
  findAll(@Query('search') search?: string) {
    return this.productsService.findAll(search);
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Get inventory dashboard totals and low-stock items' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard totals and products at or below minimum stock',
    schema: {
      example: {
        totalProducts: 5,
        totalStock: 193,
        lowStockCount: 2,
        lowStockProducts: [
          {
            id: '665f1a2b3c4d5e6f78901234',
            name: 'Pencil',
            category: 'Stationery',
            price: 8,
            quantity: 8,
            minStock: 10,
            createdAt: '2026-10-16T07:00:00.000Z',
            updatedAt: '2026-10-16T07:00:00.000Z',
          },
        ],
      },
    },
  })
  getDashboard() {
    return this.productsService.getDashboard();
  }

  @Roles('admin')
  @Post('products')
  @ApiOperation({ summary: 'Add a product to inventory (admin only)' })
  @ApiBody({
    type: CreateProductDto,
    examples: {
      createProduct: {
        summary: 'Create a stationery product',
        value: {
          name: 'Notebook',
          category: 'Stationery',
          price: 50,
          quantity: 25,
          minStock: 10,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Product created',
    schema: {
      example: {
        id: '665f1a2b3c4d5e6f78901234',
        name: 'Notebook',
        category: 'Stationery',
        price: 50,
        quantity: 25,
        minStock: 10,
        createdAt: '2026-10-16T07:00:00.000Z',
        updatedAt: '2026-10-16T07:00:00.000Z',
      },
    },
  })
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Roles('admin')
  @Put('products/:id')
  @ApiOperation({ summary: 'Update a product (admin only)' })
  @ApiParam({
    name: 'id',
    example: '665f1a2b3c4d5e6f78901234',
    description: 'MongoDB product ID',
  })
  @ApiBody({
    type: UpdateProductDto,
    examples: {
      updateProduct: {
        summary: 'Update product stock and price',
        value: {
          price: 55,
          quantity: 40,
          minStock: 12,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Updated product',
    schema: {
      example: {
        id: '665f1a2b3c4d5e6f78901234',
        name: 'Notebook',
        category: 'Stationery',
        price: 55,
        quantity: 40,
        minStock: 12,
        createdAt: '2026-10-16T07:00:00.000Z',
        updatedAt: '2026-10-16T07:30:00.000Z',
      },
    },
  })
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Roles('admin')
  @Delete('products/:id')
  @ApiOperation({ summary: 'Delete a product (admin only)' })
  @ApiParam({
    name: 'id',
    example: '665f1a2b3c4d5e6f78901234',
    description: 'MongoDB product ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Product deleted',
    schema: { example: { deleted: true } },
  })
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
