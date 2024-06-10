import { DynamicModule, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AxiosService } from '../../../lib/axios/axios.service';

import { LiveSchema } from './schemas/live.schema';

@Module({})
export class LiveSynchroModule {
  static register(): DynamicModule {
    return {
      module: LiveSynchroModule,
      imports: [
        MongooseModule.forFeature([{ name: 'Live', schema: LiveSchema }]),
      ],
      providers: [AxiosService],
    };
  }
}
