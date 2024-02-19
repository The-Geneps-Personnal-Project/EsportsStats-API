import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';

import { Model } from 'mongoose';

import { League } from './schemas/league.schema';
import { AxiosService } from 'lib/axios/axios.service';
import { LeagueDto } from './dto/league.dto';
import { ILeagues, ILeague } from './types';

@Injectable()
export class LeaguesSynchroService implements OnApplicationBootstrap {
  constructor(
    @InjectModel('League') private readonly leagueModel: Model<League>,
    private readonly axiosService: AxiosService,
  ) {}

  onApplicationBootstrap() {
    Logger.debug('LeaguesSynchroService is ready');
    this.start();
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  private async start() {
    Logger.debug('LeaguesSynchroService is running');
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
    Logger.debug('LeaguesSynchroService is saving leagues');

    for (const league of leagues) {
      const existingLeague: LeagueDto = await this.leagueModel.findOne({
        id: league.id,
      });
      if (existingLeague) {
        if (existingLeague.name !== league.name) {
          await this.leagueModel.updateOne({ id: league.id }, league, {
            upsert: true,
          });
          Logger.debug(`Updated league with ID ${league.id}`);
        }
      } else {
        await this.leagueModel.create(league);
        Logger.debug(`Created league with ID ${league.id}`);
      }
    }
  }
}
