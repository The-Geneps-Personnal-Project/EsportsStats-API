import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';

import { minutesToMilliseconds } from 'date-fns';
import { Model } from 'mongoose';

import { AxiosService } from '../../lib/axios/axios.service';
import { ILive, ILives } from './types/live';
import { Live } from './schemas/live.schema';
import { LiveDto } from './dto/live.dto';

@Injectable()
export class LiveSynchroService implements OnApplicationBootstrap {
  private readonly logger = new Logger(LiveSynchroService.name);

  constructor(
    @InjectModel(Live.name) private readonly liveModel: Model<Live>,
    private readonly axiosService: AxiosService,
    private readonly configService: ConfigService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  onApplicationBootstrap() {
    this.logger.debug('LiveSynchroService is ready');
    const frequency = minutesToMilliseconds(
      this.configService.get<number>('live.frequency'),
    );
    this.start();
    const interval = setInterval(() => {
      this.start();
    }, frequency);
    this.schedulerRegistry.addInterval('sync-live', interval);
  }

  private async start() {
    this.logger.debug('LiveSynchroService is running');
    try {
      const lives = await this.getLive();
      await this.saveLive(lives);
    } catch (error) {
      this.logger.error('Error while synchronizing live', error);
    }
  }

  private async getLive() {
    this.logger.debug('LiveSynchroService is getting live');

    const params = { hl: 'en-US' };

    const live: ILives = await this.axiosService.get(
      'https://esports-api.lolesports.com/persisted/gw/getLive',
      this.configService.get<string>('LOL_ESPORTS_API_KEY'),
      params,
    );

    this.logger.debug('LiveSynchroService has got live');
    return live.data.schedule.events;
  }

  private async saveLive(lives: ILive[]) {
    this.logger.debug('LiveSynchroService is saving live');
    for (const live of lives) {
      const onGoingLive: LiveDto = await this.liveModel.findOne({
        id: live.id,
      });
      if (onGoingLive) {
        await this.liveModel.updateOne({ id: live.id }, live);
        this.logger.debug(`Live ${live.id} has been updated`);
      } else {
        await this.liveModel.create(live);
        this.logger.debug(`Live ${live.id} has been created`);
      }
    }
  }
}
