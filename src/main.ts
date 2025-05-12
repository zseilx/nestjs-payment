import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Express, Request, Response } from 'express';
import { AppModule } from './app.module';
import { PaginatedResult } from './config/prisma/pagination';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const expressApp = app.getHttpAdapter().getInstance() as Express;

  app.enableCors({
    exposedHeaders: ['content-disposition'],
    origin: '*',
    credentials: true,
  });
  const config = new DocumentBuilder()
    .setTitle('Timely GPT AI Backend API')
    .setDescription('Timely GPT AI Backend API 설명')
    .setVersion('1.0')
    .addTag('timely-gpt-ai-backend')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT', // (선택) 'JWT' or 'Token'
        description: 'Access token',
        name: 'Authorization',
        in: 'header',
      },
      'access-token', // => 이 이름으로 security scheme이 등록됨
    )
    .build();
  const documentFactory = SwaggerModule.createDocument(app, config, {
    extraModels: [PaginatedResult],
    deepScanRoutes: true,
  });
  documentFactory.security = [{ 'access-token': [] }];
  expressApp.get('/api-back/openapi.json', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(documentFactory);
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
