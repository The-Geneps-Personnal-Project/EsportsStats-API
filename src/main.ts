import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import helmet from 'helmet';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const configService = app.get(ConfigService);

  const port = configService.get('PORT');
  const environment = configService.get('NODE_ENV');

  app.use(helmet());

  await app.listen(port || 3000);
  Logger.log(`Starting server in ${environment || 'development'} environment`);
  Logger.log(`Server running on port ${port || 3000}`);
}
bootstrap();
