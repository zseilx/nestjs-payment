import { Injectable, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { Prisma, Product } from 'generated/prisma';
import { Decimal } from 'generated/prisma/runtime/library';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { CreateProductRequest } from './dto/create-product.request';
import { DetailProductResponse } from './dto/detail-product.response';
import { ListProductResponse } from './dto/list-product.response';
import { processProductRequest } from './dto/process-product.request';
import { SearchProductRequest } from './dto/search-product.request';
import { UpdateProductRequest } from './dto/update-product.request';
import { ProductFulfillmentHandlerFactory } from './fulfillment-handler/product-fulfillment-handler.factory';

@Injectable()
export class ProductService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly fulfillmentHandlerFactory: ProductFulfillmentHandlerFactory,
  ) {}

  /**
   * VAT 포함 가격 계산
   */
  calculatePriceIncludingVat(price: Decimal, vatRate: number): Decimal {
    return price.mul(new Decimal(1).add(vatRate));
  }

  /**
   * VAT 미포함 가격 계산 (VAT 포함 가격에서 역산)
   */
  calculatePriceExcludingVat(
    priceIncludingVat: Decimal,
    vatRate: number,
  ): Decimal {
    return priceIncludingVat.div(new Decimal(1).add(vatRate));
  }

  async create(request: CreateProductRequest) {
    const productData = {
      ...request,
      vatRate: request.vatRate ?? 0.1, // 기본 부가세율 10%
    };

    const product = await this.prismaService.product.create({
      data: productData,
    });

    return plainToInstance(DetailProductResponse, product);
  }

  findAll(request: SearchProductRequest) {
    return this.prismaService.fetchPaginatedResult(
      ListProductResponse,
      Prisma.ModelName.Product,
      request,
      {},
    );
  }

  async findManyByIds(productIds: string[]): Promise<Product[]> {
    const products = await this.prismaService.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
    });

    if (products.length !== productIds.length) {
      const foundIds = new Set(products.map((p) => p.id));
      const notFoundIds = productIds.filter((id) => !foundIds.has(id));
      throw new NotFoundException(
        `다음 상품을 찾을 수 없습니다: ${notFoundIds.join(', ')}`,
      );
    }

    return products;
  }

  async findOne(productId: string) {
    const product = await this.prismaService.product.findUnique({
      where: {
        id: productId,
      },
    });

    if (!product) {
      throw new NotFoundException('해당하는 상품을 찾을 수 없습니다');
    }

    return plainToInstance(DetailProductResponse, product);
  }

  async update(productId: string, request: UpdateProductRequest) {
    const product = await this.prismaService.product.update({
      where: { id: productId },
      data: request,
    });

    return plainToInstance(DetailProductResponse, product);
  }

  async processProducts(requests: processProductRequest[]) {
    const productIds = requests.map((req) => req.productId);
    // 1. 요청된 모든 상품 정보 조회
    const products = await this.findManyByIds(productIds);

    // 2. 활성 상태가 아닌 상품 확인 (결제 진행 중 판매 중지된 상품)
    const inactiveProducts = products.filter((p) => !p.isActive);
    if (inactiveProducts.length > 0) {
      console.warn(
        `다음 상품이 판매 중지 상태입니다: ${inactiveProducts
          .map((p) => p.name)
          .join(', ')}`,
      );
      // 판매 중지된 상품이 있더라도 이행 처리는 계속 진행
    }

    // 3. 각 상품별로 이행 처리
    const fulfillmentPromises = requests.map(async (request) => {
      const product = products.find((p) => p.id === request.productId);
      if (!product) return;

      await this.fulfillmentHandlerFactory
        .getHandler(product.type)
        .fulfill(product.id, request.quantity);
    });

    // 4. 모든 이행 처리 완료 대기
    await Promise.all(fulfillmentPromises);
  }

  async refundProducts(requests: processProductRequest[]) {
    return this.prismaService.$transaction(async (tx) => {
      const productIds = requests.map((req) => req.productId);
      // 1. 요청된 모든 상품 정보 조회
      const products = await tx.product.findMany({
        where: {
          id: {
            in: productIds,
          },
        },
      });

      if (products.length !== productIds.length) {
        const foundIds = new Set(products.map((p) => p.id));
        const notFoundIds = productIds.filter((id) => !foundIds.has(id));
        throw new NotFoundException(
          `다음 상품을 찾을 수 없습니다: ${notFoundIds.join(', ')}`,
        );
      }

      // 2. 환불 불가능한 상품 확인
      const nonRefundableProducts = products.filter((p) => !p.isRefundable);
      if (nonRefundableProducts.length > 0) {
        throw new Error(
          `다음 상품은 환불이 불가능합니다: ${nonRefundableProducts
            .map((p) => p.name)
            .join(', ')}`,
        );
      }

      // 3. 각 상품별로 환불 처리
      const refundPromises = requests.map(async (request) => {
        const product = products.find((p) => p.id === request.productId);
        if (!product) return;

        await this.fulfillmentHandlerFactory
          .getHandler(product.type)
          .refund(product.id, request.quantity);
      });

      // 4. 모든 환불 처리 완료 대기
      await Promise.all(refundPromises);
    });
  }
}
