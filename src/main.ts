import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  await app.listen(3000);
  Logger.log(`Starting server in ${process.env.ENV} environment`);
  Logger.log(`Server running on port ${process.env.PORT}`);
}
bootstrap();
