import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';
import { minutesToMilliseconds } from 'date-fns';

import { AxiosService } from '../../lib/axios/axios.service';
import { LeaguesService } from '../leagues/leagues.service';
import { ISchedule, IScheduleItem } from './types/schedule';
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
      await this.getSchedule();
    } catch (error) {
      this.logger.error('Error while synchronizing schedule', error);
    }
  }

  private async scheduleApiCall(leagueId: string, pagetoken?: string) {
    const params = { hl: 'en-US', leagueId: leagueId };
    if (pagetoken) {
      params['pageToken'] = pagetoken;
    }

    const getLeagueSchedule: ISchedule = await this.axiosService.get(
      'https://esports-api.lolesports.com/persisted/gw/getSchedule',
      this.configService.get<string>('LOL_ESPORTS_API_KEY'),
      params,
    );
    return getLeagueSchedule;
  }

  private async handlePage(
    leagueScheduleItem: IScheduleItem,
    leagueId: string,
  ): Promise<IScheduleItem[] | null> {
    if (!leagueScheduleItem) {
      this.logger.warn('No schedule found');
      return null;
    }

    const allSchedules: IScheduleItem[] = [];

    const fetchSchedules = async (page: string, isOlder: boolean) => {
      const delay = (ms: number) =>
        new Promise((resolve) => setTimeout(resolve, ms));

      const getLeagueSchedule: ISchedule = await this.scheduleApiCall(
        leagueId,
        page,
      );
      allSchedules.push(getLeagueSchedule.data.schedule);
      if (getLeagueSchedule.data.schedule.pages.newer && !isOlder) {
        await delay(3000);
        await fetchSchedules(
          getLeagueSchedule.data.schedule.pages.newer,
          false,
        );
      } else if (getLeagueSchedule.data.schedule.pages.older && isOlder) {
        await delay(3000);
        await fetchSchedules(getLeagueSchedule.data.schedule.pages.older, true);
      }
    };

    if (leagueScheduleItem.pages.newer) {
      await fetchSchedules(leagueScheduleItem.pages.newer, false);
    }
    if (leagueScheduleItem.pages.older) {
      await fetchSchedules(leagueScheduleItem.pages.older, true);
    }
    return allSchedules;
  }

  private async getSchedule(): Promise<IScheduleItem[]> {
    this.logger.debug('ScheduleSynchroService is getting schedule');
    let schedule: IScheduleItem[] = [];
    const leagues = await this.leagueService.findAll();
    if (!leagues) {
      this.logger.warn('No leagues found');
      return;
    }

    for (const league of leagues) {
      const getLeagueSchedule: ISchedule = await this.scheduleApiCall(
        league.id,
      );
      const leagueSchedule = getLeagueSchedule.data.schedule;
      schedule = await this.handlePage(leagueSchedule, league.id);
      this.logger.verbose(
        'ScheduleSynchroService has got schedule for league id: ' + league.id,
      );
      await this.saveSchedule(schedule);
    }
  }

  private async saveSchedule(schedule: IScheduleItem[]) {
    this.logger.verbose('Start schedule data treatment');

    if (!schedule) {
      this.logger.warn('No schedule found');
      return;
    }
    for (const scheduleItem of schedule) {
      for (const event of scheduleItem.events) {
        const existingEvent: ScheduleEvent = await this.scheduleEventModel
          .findOne({ id: event.match.id })
          .exec();
        if (existingEvent) {
          if (existingEvent.state !== event.state) {
            await this.scheduleEventModel.updateOne(
              {
                id: event.match.id,
              },
              event,
            );
          }
        } else {
          const newEvent = new this.scheduleEventModel(event);
          await newEvent.save();
        }
      }
    }
    this.logger.verbose('Schedule data treatment is done');
  }
}
