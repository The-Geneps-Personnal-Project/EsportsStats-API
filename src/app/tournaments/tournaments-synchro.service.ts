import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';

import { Model } from 'mongoose';
import { Tournament } from './schemas/tournament.schema';
import { AxiosService } from 'lib/axios/axios.service';
import { TournamentDto } from './dto/tournament.dto';
import { ITournament, ITournaments } from './types/tournaments';

@Injectable()
export class TournamentsSynchroService implements OnApplicationBootstrap {
  private readonly logger = new Logger(TournamentsSynchroService.name);

  constructor(
    @InjectModel(Tournament.name)
    private readonly tournamentModel: Model<Tournament>,
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

    const params = { hl: process.env.LOL_ESPORTS_API_HL, leagueId: 'xxx' };

    const leagues: ITournaments = await this.axiosService.get(
      'https://esports-api.lolesports.com/persisted/gw/getTournamentsForLeague',
      process.env.LOL_ESPORTS_API_KEY,
      params,
    );

    Logger.debug('LeaguesSynchroService has got leagues');
    return leagues.data.leagues.tournaments;
  }

  private async saveLeagues(tournaments: ITournament[]) {
    this.logger.debug('Saving leagues');
    for (const tournament of tournaments) {
      const existingTournament: TournamentDto = await this.tournamentModel
        .findOne({ id: tournament.id })
        .exec();
      if (existingTournament) {
        if (existingTournament.slug !== tournament.slug) {
          await this.tournamentModel.updateOne(
            { id: tournament.id },
            tournament,
          );
          this.logger.debug(`Updated league with ID ${tournament.id}`);
        }
      } else {
        await this.tournamentModel.create(tournament);
        this.logger.debug(`Created league with ID ${tournament.id}`);
      }
    }
  }
}
