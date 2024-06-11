import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SchedulerRegistry } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';

import { Model } from 'mongoose';
import { hoursToMilliseconds } from 'date-fns';

import { LeaguesService } from '../leagues/leagues.service';
import { AxiosService } from '../../lib/axios/axios.service';

import { Tournament } from './schemas/tournament.schema';
import { TournamentDto } from './dto/tournament.dto';
import { ITournament, ITournaments } from './types/tournaments';

@Injectable()
export class TournamentsSynchroService implements OnApplicationBootstrap {
  private readonly logger = new Logger(TournamentsSynchroService.name);

  constructor(
    @InjectModel(Tournament.name)
    private readonly tournamentModel: Model<Tournament>,
    private readonly axiosService: AxiosService,
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly configService: ConfigService,
    private readonly LeaguesService: LeaguesService,
  ) {}

  onApplicationBootstrap() {
    this.logger.debug('TournamentsSynchroService is ready');
    const frequency = hoursToMilliseconds(
      this.configService.get<number>('tournaments.frequency'),
    );
    this.start();
    const interval = setInterval(() => {
      this.start();
    }, frequency);
    this.schedulerRegistry.addInterval('sync-tournaments', interval);
  }

  private async start() {
    this.logger.debug('TournamentsSynchroService is running');
    try {
      const tournaments = await this.getTournaments();
      await this.saveTournaments(tournaments);
    } catch (error) {
      this.logger.error('Error while synchronizing tournaments', error);
    }
  }

  private async assignLeagueIdToTournaments(
    tournaments: ITournament[],
    id: string,
  ) {
    return tournaments.map((tournament) => {
      return { ...tournament, leagueId: id };
    });
  }

  private async getTournaments() {
    this.logger.debug('TournamentsSynchroService is getting tournaments');

    const leagues = await this.LeaguesService.findAll();
    if (!leagues) {
      this.logger.warn('No Leagues found');
      return;
    }

    const tournamentsList = leagues.map(async (league) => {
      const params = { hl: 'en-US', leagueId: league.id };

      const tournaments: ITournaments = await this.axiosService.get(
        'https://esports-api.lolesports.com/persisted/gw/getTournamentsForLeague',
        this.configService.get<string>('LOL_ESPORTS_API_KEY'),
        params,
      );
      const tournamentsData = this.assignLeagueIdToTournaments(
        tournaments.data.leagues[0].tournaments,
        league.id,
      );
      return tournamentsData;
    });

    const tournamentsData = await Promise.all(tournamentsList);
    this.logger.debug('TournamentsSynchroService has got tournaments');
    return tournamentsData.flat();
  }

  private async saveTournaments(tournaments: ITournament[]) {
    this.logger.debug('Start tournaments data treatment');

    if (!tournaments) {
      this.logger.warn('No Tournaments found');
      return;
    }

    for (const tournament of tournaments) {
      const existingTournament: TournamentDto = await this.tournamentModel
        .findOne({ id: tournament.id })
        .exec();
      if (existingTournament) {
        if (existingTournament.slug !== tournament.slug) {
          await this.tournamentModel.updateOne(
            {
              id: tournament.id,
            },
            tournament,
          );
          this.logger.debug(`Updated tournament with ID ${tournament.id}`);
        }
      } else {
        await this.tournamentModel.create(tournament);
        this.logger.debug(`Created tournament with ID ${tournament.id}`);
      }
    }
    this.logger.debug('End tournaments data treatment');
  }
}
