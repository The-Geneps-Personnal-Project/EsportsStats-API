import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';

import { Model } from 'mongoose';
import { League } from './schemas/league.schema';
import { AxiosService } from 'lib/axios/axios.service';
import { LeagueDto } from './dto/league.dto';
import { ILeagues, ILeague } from './types/leagues';

@Injectable()
export class LeaguesSynchroService implements OnApplicationBootstrap {
  private readonly logger = new Logger(LeaguesSynchroService.name);

  constructor(
    @InjectModel(League.name) private readonly leagueModel: Model<League>,
    private readonly axiosService: AxiosService,
  ) {}

  onApplicationBootstrap() {
    this.logger.debug('LeaguesSynchroService is ready');
    this.start();
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  private async start() {
    this.logger.debug('LeaguesSynchroService is running');
    const leagues = await this.getLeagues();
    await this.saveLeagues(leagues);
  }

  private async getLeagues() {
    Logger.debug('LeaguesSynchroService is getting leagues');

    const params = { hl: process.env.LOL_ESPORTS_API_HL };

    const leagues: ILeagues = await this.axiosService.get(
      'https://esports-api.lolesports.com/persisted/gw/getLeagues',
      process.env.LOL_ESPORTS_API_KEY,
      params,
    );

    Logger.debug('LeaguesSynchroService has got leagues');
    return leagues.data.leagues;
  }

  private async saveLeagues(leagues: ILeague[]) {
    this.logger.debug('Saving leagues');
    for (const league of leagues) {
      const existingLeague: LeagueDto = await this.leagueModel.findOne({ id: league.id }).exec();
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
  }
}