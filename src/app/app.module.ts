import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { MongooseModule } from '@nestjs/mongoose';

import { validate } from 'src/config/env.validation';
import configuration from 'src/config/configuration';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerMiddleware } from 'middleware/logger.middleware';

import { LeaguesSynchroModule } from './leagues/leagues-synchro.module';
import { TournamentsSynchroModule } from './tournaments/tournaments-synchro.module';
import { ScheduleSynchroModule } from './schedule/schedule-synchro.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      cache: true,
      load: [configuration],
      validate,
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URI),
    LeaguesSynchroModule.register(),
    TournamentsSynchroModule.register(),
    ScheduleSynchroModule.register(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
