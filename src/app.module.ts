import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { validate } from 'config/env.validation';
import configuration from 'config/configuration';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      cache: true,
      load: [configuration],
      validate,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
