import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Product, ProductType } from 'generated/prisma';
import { Decimal } from 'generated/prisma/runtime/library';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { CreateProductRequest } from './dto/create-product.request';
import { processProductRequest } from './dto/process-product.request';
import { SearchProductRequest } from './dto/search-product.request';
import { UpdateProductRequest } from './dto/update-product.request';
import { ProductFulfillmentHandlerFactory } from './fulfillment-handler/product-fulfillment-handler.factory';
import { ProductService } from './product.service';

// plainToInstance만 mock으로 처리하고 Type은 실제 것을 사용
jest.mock('class-transformer', () => {
  const actualClassTransformer = jest.requireActual('class-transformer');
  return {
    ...actualClassTransformer,
    plainToInstance: jest.fn((ctor, obj) => obj),
  };
});

describe('ProductService', () => {
  let service: ProductService;
  let prismaService: jest.Mocked<PrismaService>;
  let fulfillmentHandlerFactory: jest.Mocked<ProductFulfillmentHandlerFactory>;

  const createMockProduct = (overrides: Partial<Product> = {}): Product => ({
    id: 'test-product-id',
    name: 'Test Product',
    description: 'Test Description',
    price: new Decimal(10000),
    imageUrl: 'https://example.com/image.jpg',
    currency: 'KRW',
    stock: 100,
    type: ProductType.CREDIT,
    isActive: true,
    isRefundable: true,
    vatRate: 0.1,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  });

  const mockFulfillmentHandler = {
    fulfill: jest.fn().mockResolvedValue(undefined),
    refund: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: PrismaService,
          useValue: {
            product: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            fetchPaginatedResult: jest.fn(),
            $transaction: jest.fn(),
          },
        },
        {
          provide: ProductFulfillmentHandlerFactory,
          useValue: {
            getHandler: jest.fn().mockReturnValue(mockFulfillmentHandler),
          },
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    prismaService = module.get(PrismaService);
    fulfillmentHandlerFactory = module.get(ProductFulfillmentHandlerFactory);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('calculatePriceIncludingVat', () => {
    it('should calculate price including VAT correctly', () => {
      const price = new Decimal(10000);
      const vatRate = 0.1;

      const result = service.calculatePriceIncludingVat(price, vatRate);

      expect(result.toNumber()).toBe(11000);
    });

    it('should handle zero VAT rate', () => {
      const price = new Decimal(10000);
      const vatRate = 0;

      const result = service.calculatePriceIncludingVat(price, vatRate);

      expect(result.toNumber()).toBe(10000);
    });
  });

  describe('calculatePriceExcludingVat', () => {
    it('should calculate price excluding VAT correctly', () => {
      const priceIncludingVat = new Decimal(11000);
      const vatRate = 0.1;

      const result = service.calculatePriceExcludingVat(
        priceIncludingVat,
        vatRate,
      );

      expect(result.toNumber()).toBe(10000);
    });
  });

  describe('create', () => {
    it('should create product with default VAT rate', async () => {
      const request: CreateProductRequest = {
        name: 'Test Product',
        price: new Decimal(10000),
        currency: 'KRW',
        type: ProductType.CREDIT,
        isRefundable: true,
      };

      const mockProduct = createMockProduct();
      (prismaService.product.create as jest.Mock).mockResolvedValue(
        mockProduct,
      );

      const result = await service.create(request);

      expect(prismaService.product.create).toHaveBeenCalledWith({
        data: {
          ...request,
          vatRate: 0.1,
        },
      });
      expect(result).toEqual(mockProduct);
    });

    it('should create product with custom VAT rate', async () => {
      const request: CreateProductRequest = {
        name: 'Test Product',
        price: new Decimal(10000),
        currency: 'KRW',
        type: ProductType.CREDIT,
        isRefundable: true,
        vatRate: 0.05,
      };

      const mockProduct = createMockProduct({ vatRate: 0.05 });
      (prismaService.product.create as jest.Mock).mockResolvedValue(
        mockProduct,
      );

      const result = await service.create(request);

      expect(prismaService.product.create).toHaveBeenCalledWith({
        data: request,
      });
      expect(result).toEqual(mockProduct);
    });
  });

  describe('findOne', () => {
    it('should return product when found', async () => {
      const productId = 'test-product-id';
      const mockProduct = createMockProduct();

      (prismaService.product.findUnique as jest.Mock).mockResolvedValue(
        mockProduct,
      );

      const result = await service.findOne(productId);

      expect(prismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: productId },
      });
      expect(result).toEqual(mockProduct);
    });

    it('should throw NotFoundException when product not found', async () => {
      const productId = 'non-existent-id';

      (prismaService.product.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.findOne(productId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findManyByIds', () => {
    it('should return products when all found', async () => {
      const productIds = ['id1', 'id2'];
      const mockProducts = [
        createMockProduct({ id: 'id1' }),
        createMockProduct({ id: 'id2' }),
      ];

      (prismaService.product.findMany as jest.Mock).mockResolvedValue(
        mockProducts,
      );

      const result = await service.findManyByIds(productIds);

      expect(result).toEqual(mockProducts);
    });

    it('should throw NotFoundException when some products not found', async () => {
      const productIds = ['id1', 'id2', 'id3'];
      const mockProducts = [createMockProduct({ id: 'id1' })];

      (prismaService.product.findMany as jest.Mock).mockResolvedValue(
        mockProducts,
      );

      await expect(service.findManyByIds(productIds)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update product successfully', async () => {
      const productId = 'test-product-id';
      const request: UpdateProductRequest = {
        name: 'Updated Product',
        price: new Decimal(15000),
      };
      const mockProduct = createMockProduct({
        name: 'Updated Product',
        price: new Decimal(15000),
      });

      (prismaService.product.update as jest.Mock).mockResolvedValue(
        mockProduct,
      );

      const result = await service.update(productId, request);

      expect(prismaService.product.update).toHaveBeenCalledWith({
        where: { id: productId },
        data: request,
      });
      expect(result).toEqual(mockProduct);
    });
  });

  describe('processProducts', () => {
    it('should process products successfully', async () => {
      const requests: processProductRequest[] = [
        { productId: 'id1', quantity: 2 },
        { productId: 'id2', quantity: 1 },
      ];
      const mockProducts = [
        createMockProduct({ id: 'id1', isActive: true }),
        createMockProduct({ id: 'id2', isActive: true }),
      ];

      (prismaService.product.findMany as jest.Mock).mockResolvedValue(
        mockProducts,
      );

      await service.processProducts(requests);

      expect(fulfillmentHandlerFactory.getHandler).toHaveBeenCalledTimes(2);
      expect(mockFulfillmentHandler.fulfill).toHaveBeenCalledTimes(2);
      expect(mockFulfillmentHandler.fulfill).toHaveBeenCalledWith('id1', 2);
      expect(mockFulfillmentHandler.fulfill).toHaveBeenCalledWith('id2', 1);
    });

    it('should warn about inactive products but continue processing', async () => {
      const originalWarn = console.warn;
      const mockWarn = jest.fn();
      console.warn = mockWarn;

      const requests: processProductRequest[] = [
        { productId: 'id1', quantity: 1 },
      ];
      const mockProducts = [
        createMockProduct({
          id: 'id1',
          isActive: false,
          name: 'Inactive Product',
        }),
      ];

      (prismaService.product.findMany as jest.Mock).mockResolvedValue(
        mockProducts,
      );

      await service.processProducts(requests);

      expect(mockWarn).toHaveBeenCalledWith(
        '다음 상품이 판매 중지 상태입니다: Inactive Product',
      );
      expect(mockFulfillmentHandler.fulfill).toHaveBeenCalledWith('id1', 1);

      console.warn = originalWarn;
    });
  });

  describe('refundProducts', () => {
    it('should refund products successfully', async () => {
      const requests: processProductRequest[] = [
        { productId: 'id1', quantity: 1 },
      ];
      const mockProducts = [
        createMockProduct({ id: 'id1', isRefundable: true }),
      ];

      const mockTransaction = jest.fn().mockImplementation(async (callback) => {
        const tx = {
          product: {
            findMany: jest.fn().mockResolvedValue(mockProducts),
          },
        };
        return await callback(tx);
      });

      (prismaService.$transaction as jest.Mock).mockImplementation(
        mockTransaction,
      );

      await service.refundProducts(requests);

      expect(fulfillmentHandlerFactory.getHandler).toHaveBeenCalled();
      expect(mockFulfillmentHandler.refund).toHaveBeenCalledWith('id1', 1);
    });

    it('should throw error for non-refundable products', async () => {
      const requests: processProductRequest[] = [
        { productId: 'id1', quantity: 1 },
      ];
      const mockProducts = [
        createMockProduct({
          id: 'id1',
          isRefundable: false,
          name: 'Non-refundable Product',
        }),
      ];

      const mockTransaction = jest.fn().mockImplementation(async (callback) => {
        const tx = {
          product: {
            findMany: jest.fn().mockResolvedValue(mockProducts),
          },
        };
        return await callback(tx);
      });

      (prismaService.$transaction as jest.Mock).mockImplementation(
        mockTransaction,
      );

      await expect(service.refundProducts(requests)).rejects.toThrow(
        '다음 상품은 환불이 불가능합니다: Non-refundable Product',
      );
    });

    it('should throw NotFoundException when product not found in transaction', async () => {
      const requests: processProductRequest[] = [
        { productId: 'id1', quantity: 1 },
        { productId: 'id2', quantity: 1 },
      ];
      const mockProducts = [createMockProduct({ id: 'id1' })];

      const mockTransaction = jest.fn().mockImplementation(async (callback) => {
        const tx = {
          product: {
            findMany: jest.fn().mockResolvedValue(mockProducts),
          },
        };
        return await callback(tx);
      });

      (prismaService.$transaction as jest.Mock).mockImplementation(
        mockTransaction,
      );

      await expect(service.refundProducts(requests)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('should call fetchPaginatedResult with correct parameters', () => {
      const request: SearchProductRequest = {
        page: 1,
        take: 10,
        order: 'desc',
        keyword: 'test',
      };

      const mockResult = {
        list: [createMockProduct()],
        paging: { currentPage: 1, take: 10, totalRow: 1 },
      };

      (prismaService.fetchPaginatedResult as jest.Mock).mockReturnValue(
        mockResult,
      );

      const result = service.findAll(request);

      expect(prismaService.fetchPaginatedResult).toHaveBeenCalledWith(
        expect.any(Function), // ListProductResponse constructor
        'Product',
        request,
        {},
      );
      expect(result).toEqual(mockResult);
    });
  });
});
