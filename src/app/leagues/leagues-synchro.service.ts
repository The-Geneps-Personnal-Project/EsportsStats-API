import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';

import { Model } from 'mongoose';
import { hoursToMilliseconds } from 'date-fns';

import { AxiosService } from '../../lib/axios/axios.service';

import { League } from './schemas/league.schema';
import { LeagueDto } from './dto/league.dto';
import { ILeagues, ILeague } from './types/leagues';

@Injectable()
export class LeaguesSynchroService implements OnApplicationBootstrap {
  private readonly logger = new Logger(LeaguesSynchroService.name);

  constructor(
    @InjectModel(League.name) private readonly leagueModel: Model<League>,
    private readonly axiosService: AxiosService,
    private readonly configService: ConfigService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  onApplicationBootstrap() {
    this.logger.debug('LeaguesSynchroService is ready');
    const frequency = hoursToMilliseconds(
      this.configService.get<number>('leagues.frequency'),
    );
    this.start();
    const interval = setInterval(() => {
      this.start();
    }, frequency);
    this.schedulerRegistry.addInterval('sync-leagues', interval);
  }

  private async start() {
    this.logger.debug('LeaguesSynchroService is running');
    try {
      const leagues = await this.getLeagues();
      await this.saveLeagues(leagues);
    } catch (error) {
      this.logger.error('Error while synchronizing leagues', error);
    }
  }

  private async getLeagues() {
    this.logger.debug('LeaguesSynchroService is getting leagues');

    const params = { hl: 'en-US' };

    const leagues: ILeagues = await this.axiosService.get(
      'https://esports-api.lolesports.com/persisted/gw/getLeagues',
      this.configService.get<string>('LOL_ESPORTS_API_KEY'),
      params,
    );

    this.logger.debug('LeaguesSynchroService has got leagues');
    return leagues.data.leagues;
  }

  private async saveLeagues(leagues: ILeague[]) {
    this.logger.debug('Start leagues data treatment');

    for (const league of leagues) {
      const existingLeague: LeagueDto = await this.leagueModel
        .findOne({ id: league.id })
        .exec();
      if (existingLeague) {
        if (existingLeague.name !== league.name) {
          await this.leagueModel.updateOne({ id: league.id }, league);
          this.logger.debug(`Updated league with ID ${league.id}`);
        }
      } else {
        await this.leagueModel.create(league);
        this.logger.debug(`Created league with ID ${league.id}`);
      }
    }
    this.logger.debug('End leagues data treatment');
  }
}
