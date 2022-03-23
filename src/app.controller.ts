import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private configService: ConfigService,
  ) {}

  @Get()
  getHello(): string {
    console.log(process.env.NODE_ENV);
    const envName = this.configService.get<string>('ENVIRONMENT_NAME');
    console.log(envName);
    return this.appService.getHello();
  }
}
