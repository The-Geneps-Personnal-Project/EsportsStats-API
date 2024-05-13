import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';

import { Model } from 'mongoose';
import { minutesToMilliseconds } from 'date-fns';

import { AxiosService } from '../../../lib/axios/axios.service';
import { LeaguesService } from '../leagues/leagues.service';
import { ISchedule, IScheduleItem } from './types/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { ScheduleEvent } from './schema/scheduleEvent.schema';

@Injectable()
export class ScheduleSynchroService implements OnApplicationBootstrap {
  logger = new Logger(ScheduleSynchroService.name);
  constructor(
    @InjectModel(ScheduleEvent.name)
    private readonly scheduleEventModel: Model<ScheduleEvent>,
    private readonly configService: ConfigService,
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly axiosService: AxiosService,
    private readonly leagueService: LeaguesService,
  ) {}

  onApplicationBootstrap() {
    this.logger.debug('ScheduleSynchroService is ready');
    const frequency = minutesToMilliseconds(
      this.configService.get<number>('schedule.frequency'),
    );
    this.start();
    const interval = setInterval(() => {
      this.start();
    }, frequency);
    this.schedulerRegistry.addInterval('sync-schedule', interval);
  }

  private async start() {
    this.logger.debug('ScheduleSynchroService is running');
    try {
      const schedule = await this.getSchedule();
      await this.saveSchedule(schedule);
    } catch (error) {
      this.logger.error('Error while synchronizing schedule', error);
    }
  }

  private async getSchedule() {
    this.logger.debug('ScheduleSynchroService is getting schedule');
    const leagues = await this.leagueService.findAll();
    if (!leagues) {
      this.logger.warn('No leagues found');
      return;
    }

    const schedulePromise = leagues.map(async (league) => {
      const params = { hl: 'en-US', leagueId: league.id };

      const leagueSchedule: ISchedule = await this.axiosService.get(
        'https://esports-api.lolesports.com/persisted/gw/getSchedule',
        this.configService.get<string>('LOL_ESPORTS_API_KEY'),
        params,
      );

      return leagueSchedule.data.schedule;
    });

    const schedule = await Promise.all(schedulePromise);
    this.logger.debug('ScheduleSynchroService has got schedule');
    return schedule.flat();
  }

  private async saveSchedule(schedule: IScheduleItem[]) {
    this.logger.debug('Start schedule data treatment');

    if (!schedule) {
      this.logger.warn('No schedule found');
      return;
    }
  }
}
