import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  if (process.env.NODE_ENV === 'development') {
    app.enableCors({
      origin: true,
      credentials: true,
    });
  }

  app.use(cookieParser());
  await app.listen(5000);
}
bootstrap();
