import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma/prisma.service';

@Injectable()
export class ProductService {
  constructor(private readonly prismaService: PrismaService) {}

  findAll() {
    return this.prismaService.product.findMany();
  }

  findManyByIds(productIds: string[]) {
    return this.prismaService.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
    });
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

    return product;
  }
}
