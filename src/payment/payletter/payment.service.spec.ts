import { Test, TestingModule } from '@nestjs/testing';
import { PayletterService } from './payletter.service';

describe('PayletterService', () => {
  let service: PayletterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PayletterService],
    }).compile();

    service = module.get<PayletterService>(PayletterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
