import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { AppService } from './app.service';
import { scalarHtml } from './scalar';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('doc')
  getScalarDoc(@Res() res: Response) {
    res.setHeader('Content-Type', 'text/html');
    res.send(scalarHtml);
    res.end();
  }
}
