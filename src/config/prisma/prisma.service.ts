import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { Prisma, PrismaClient } from 'generated/prisma';
import { InfinityScrollOptions, InfinityScrollResult } from './infinity-scroll';
import { PaginatedResult, PaginationOptions } from './pagination';

type PrismaModel = {
  findMany: (args: any) => Promise<Array<{ id: string }>>;
  count: (args: any) => Promise<number>;
};

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    // pass PrismaClientOptions e.g. logging levels or error formatting
    const level = process.env.PRISMA_LOG_LEVEL?.toLowerCase() ?? 'warn';
    const levels: Prisma.LogLevel[] = ['query', 'info', 'warn', 'error'];

    // 현재 레벨 인덱스 기준으로 포함할 레벨 필터링
    const currentIndex = levels.indexOf(level as Prisma.LogLevel);
    const enabledLevels: Prisma.LogLevel[] =
      currentIndex >= 0 ? levels.slice(currentIndex) : ['warn', 'error'];

    // log 설정 생성
    const logOptions: Prisma.LogDefinition[] = enabledLevels.map((l) => ({
      level: l,
      emit: 'stdout',
    }));

    super({ log: logOptions });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async fetchPaginatedResult<T, S>(
    Ctor: new (...args: any[]) => T,
    model: Prisma.ModelName,
    { page = 1, take = 10, order = 'desc' }: PaginationOptions,
    search?: S,
  ): Promise<PaginatedResult<T>> {
    const skip = (page - 1) * take;

    // 모델을 동적으로 참조
    const modelRef = this[model] as PrismaModel;

    const [results, totalRow] = await Promise.all([
      modelRef.findMany({
        skip,
        take,
        where: search,
        orderBy: {
          id: order,
        },
      }),
      modelRef.count({
        where: search,
      }),
    ]);

    return {
      list: results.map((result) => plainToInstance(Ctor, result)),
      paging: {
        currentPage: page,
        take: take,
        totalRow,
      },
    };
  }

  async fetchInfinityResult<T, S>(
    Ctor: new (...args: any[]) => T,
    model: Prisma.ModelName,
    { take = 10, order = 'desc', cursor }: InfinityScrollOptions,
    prisma: PrismaClient,
    search?: S,
  ): Promise<InfinityScrollResult<T>> {
    // 모델을 동적으로 참조
    const modelRef = prisma[model] as PrismaModel;

    const [results, totalRow] = await Promise.all([
      modelRef.findMany({
        cursor: cursor
          ? {
              id: cursor,
            }
          : undefined,
        take,
        where: search,
        orderBy: {
          id: order,
        },
      }),
      modelRef.count({
        where: search,
      }),
    ]);

    return {
      list: results.map((result) => plainToInstance(Ctor, result)),
      paging: {
        cursor: results[results.length - 1]?.id ?? null,
        take: take,
        totalRow,
      },
    };
  }
}
