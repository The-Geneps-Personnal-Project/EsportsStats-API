import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';
import { hoursToMilliseconds } from 'date-fns';

import { AxiosService } from '../../lib/axios/axios.service';
import { ITeam, ITeams } from './types/teams';
import { Team } from './schemas/teams.schema';

@Injectable()
export class TeamsSynchroService implements OnApplicationBootstrap {
  private readonly logger = new Logger(TeamsSynchroService.name);

  constructor(
    @InjectModel('Team') private readonly teamModel: Model<Team>,
    private readonly axiosService: AxiosService,
    private readonly configService: ConfigService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  onApplicationBootstrap() {
    this.logger.debug('TeamsSynchroService is ready');
    const frequency = hoursToMilliseconds(
      this.configService.get<number>('teams.frequency'),
    );
    this.start();
    const interval = setInterval(() => {
      this.start();
    }, frequency);
    this.schedulerRegistry.addInterval('sync-teams', interval);
  }

  private async start() {
    this.logger.debug('TeamsSynchroService is running');
    try {
      const teams = await this.getTeams();
      await this.saveTeams(teams);
    } catch (error) {
      this.logger.error('Error while synchronizing teams', error);
    }
  }

  private async getTeams() {
    this.logger.debug('TeamsSynchroService is getting teams');

    const params = { hl: 'en-US' };

    const teams: ITeams = await this.axiosService.get(
      'https://esports-api.lolesports.com/persisted/gw/getTeams',
      this.configService.get<string>('LOL_ESPORTS_API_KEY'),
      params,
    );

    this.logger.debug('TeamsSynchroService has got teams');
    return teams.data.teams;
  }

  private async saveTeams(teams: ITeam[]) {
    this.logger.debug('TeamsSynchroService is saving teams');
    for (const team of teams) {
      const existingTeam = await this.teamModel.findOne({ id: team.id });
      if (existingTeam) {
        await this.teamModel.updateOne({ id: team.id }, team);
        this.logger.debug(`TeamsSynchroService has updated team ${team.id}`);
      } else {
        const newTeam = new this.teamModel(team);
        await newTeam.save();
        this.logger.debug(`TeamsSynchroService has saved team ${team.id}`);
      }
    }
    this.logger.debug('TeamsSynchroService has saved teams');
  }
}
