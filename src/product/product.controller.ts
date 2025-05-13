import { Controller, Get, Param } from '@nestjs/common';
import { ProductService } from './product.service';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  findMany() {
    return this.productService.findAll();
  }

  @Get(':productId')
  findOne(@Param('productId') productId: string) {
    return this.productService.findOne(productId);
  }
}
