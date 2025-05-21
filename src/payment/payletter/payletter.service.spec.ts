import { HttpService } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';
import { AppConfigService } from 'src/config/app-config/app-config.service';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { OrderService } from 'src/order/order.service';
import { PayletterService } from './payletter.service';

describe('PayletterService', () => {
  let service: PayletterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PayletterService,
        { provide: HttpService, useValue: {} },
        { provide: PrismaService, useValue: {} },
        { provide: OrderService, useValue: {} },
        {
          provide: AppConfigService,
          useValue: { get: jest.fn().mockReturnValue({}) },
        },
      ],
    }).compile();

    service = module.get<PayletterService>(PayletterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
