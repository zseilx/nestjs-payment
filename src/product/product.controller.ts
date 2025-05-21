import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { PagingInfo } from 'src/config/prisma/pagination';
import { CreateProductRequest } from './dto/create-product.request';
import { DetailProductResponse } from './dto/detail-product.response';
import { ListProductResponse } from './dto/list-product.response';
import { SearchProductRequest } from './dto/search-product.request';
import { UpdateProductRequest } from './dto/update-product.request';
import { ProductService } from './product.service';

@ApiTags('상품')
@ApiExtraModels(DetailProductResponse, ListProductResponse)
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @ApiOperation({ summary: '상품 생성' })
  @ApiCreatedResponse({
    schema: { $ref: getSchemaPath(DetailProductResponse) },
  })
  @Post()
  create(@Body() request: CreateProductRequest) {
    return this.productService.create(request);
  }

  @ApiOperation({ summary: '상품 목록 조회' })
  @ApiOkResponse({
    schema: {
      allOf: [
        {
          properties: {
            paging: { $ref: getSchemaPath(PagingInfo) },
            list: {
              type: 'array',
              items: { $ref: getSchemaPath(ListProductResponse) },
            },
          },
        },
      ],
    },
  })
  @Get()
  findMany(@Query() request: SearchProductRequest) {
    return this.productService.findAll(request);
  }

  @ApiOperation({ summary: '상품 상세 조회' })
  @ApiOkResponse({
    schema: { $ref: getSchemaPath(DetailProductResponse) },
  })
  @Get(':productId')
  findOne(@Param('productId') productId: string) {
    return this.productService.findOne(productId);
  }

  @ApiOperation({ summary: '상품 수정' })
  @ApiOkResponse({
    schema: { $ref: getSchemaPath(DetailProductResponse) },
  })
  @Put(':productId')
  update(
    @Param('productId') productId: string,
    @Body() request: UpdateProductRequest,
  ) {
    return this.productService.update(productId, request);
  }
}
