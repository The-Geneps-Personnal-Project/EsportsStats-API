import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Logger } from '@nestjs/common';

import { AppModule } from './app.module';
import { ConfigService } from './config/config.service';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  const port = configService.port || 3000;

  await app.listen(port);
  Logger.log(
    `Starting server in ${process.env.NODE_ENV || 'development'} environment`,
  );
  Logger.log(`Server running on port ${port}`);
}
bootstrap();
