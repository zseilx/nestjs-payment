import { Test, TestingModule } from '@nestjs/testing';
import { Product } from 'generated/prisma';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { ProductFulfillmentHandlerFactory } from './fulfillment-handler/product-fulfillment-handler.factory';
import { ProductService } from './product.service';

describe('ProductService', () => {
  let service: ProductService;
  let prismaService: jest.Mocked<PrismaService>;
  let fulfillmentHandlerFactory: jest.Mocked<ProductFulfillmentHandlerFactory>;

  const createMockProduct = (id: string, isActive: boolean): Product => ({
    id,
    name: `Product ${id}`,
    description: null,
    price: 1000,
    imageUrl: null,
    currency: 'KRW',
    stock: 100,
    type: 'CREDIT',
    isActive,
    isRefundable: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: PrismaService,
          useValue: {
            product: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
            },
          },
        },
        {
          provide: ProductFulfillmentHandlerFactory,
          useValue: {
            getHandler: jest.fn().mockReturnValue({
              fulfill: jest.fn(),
            }),
          },
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    prismaService = module.get(PrismaService);
    fulfillmentHandlerFactory = module.get(ProductFulfillmentHandlerFactory);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // describe('findManyByIds', () => {
  //   it('should return products when all ids exist', async () => {
  //     const mockProducts = [
  //       createMockProduct('1', true),
  //       createMockProduct('2', true),
  //     ];

  //     (prismaService.product.findMany as jest.Mock).mockResolvedValue(
  //       mockProducts,
  //     );

  //     const result = await service.findManyByIds(['1', '2']);
  //     expect(result).toEqual(mockProducts);
  //     expect(prismaService.product.findMany).toHaveBeenCalledWith({
  //       where: {
  //         id: {
  //           in: ['1', '2'],
  //         },
  //       },
  //     });
  //   });

  //   it('should throw NotFoundException when some products are not found', async () => {
  //     const mockProducts = [createMockProduct('1', true)];

  //     (prismaService.product.findMany as jest.Mock).mockResolvedValue(
  //       mockProducts,
  //     );

  //     await expect(service.findManyByIds(['1', '2'])).rejects.toThrow(
  //       NotFoundException,
  //     );
  //   });
  // });

  // describe('findOne', () => {
  //   it('should return a product when it exists', async () => {
  //     const mockProduct = createMockProduct('1', true);

  //     (prismaService.product.findUnique as jest.Mock).mockResolvedValue(
  //       mockProduct,
  //     );

  //     const result = await service.findOne('1');
  //     expect(result).toEqual(mockProduct);
  //     expect(prismaService.product.findUnique).toHaveBeenCalledWith({
  //       where: {
  //         id: '1',
  //       },
  //     });
  //   });

  //   it('should throw NotFoundException when product is not found', async () => {
  //     (prismaService.product.findUnique as jest.Mock).mockResolvedValue(null);

  //     await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
  //   });
  // });

  // describe('processProducts', () => {
  //   it('should process all products successfully', async () => {
  //     const mockProducts = [
  //       createMockProduct('1', true),
  //       createMockProduct('2', true),
  //     ];

  //     (prismaService.product.findMany as jest.Mock).mockResolvedValue(
  //       mockProducts,
  //     );

  //     const mockHandler = {
  //       fulfill: jest.fn().mockResolvedValue(undefined),
  //     };
  //     fulfillmentHandlerFactory.getHandler.mockReturnValue(mockHandler);

  //     await service.processProducts([
  //       { productId: '1', quantity: 1 },
  //       { productId: '2', quantity: 1 },
  //     ]);

  //     expect(fulfillmentHandlerFactory.getHandler).toHaveBeenCalledTimes(2);
  //     expect(mockHandler.fulfill).toHaveBeenCalledTimes(2);
  //   });

  //   it('should continue processing even when some products are inactive', async () => {
  //     const mockProducts = [
  //       createMockProduct('1', false),
  //       createMockProduct('2', true),
  //     ];

  //     (prismaService.product.findMany as jest.Mock).mockResolvedValue(
  //       mockProducts,
  //     );

  //     const mockHandler = {
  //       fulfill: jest.fn().mockResolvedValue(undefined),
  //     };
  //     fulfillmentHandlerFactory.getHandler.mockReturnValue(mockHandler);

  //     await service.processProducts([
  //       { productId: '1', quantity: 1 },
  //       { productId: '2', quantity: 1 },
  //     ]);

  //     expect(fulfillmentHandlerFactory.getHandler).toHaveBeenCalledTimes(2);
  //     expect(mockHandler.fulfill).toHaveBeenCalledTimes(2);
  //   });
  // });
});
