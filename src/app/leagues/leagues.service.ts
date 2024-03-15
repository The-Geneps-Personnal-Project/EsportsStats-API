import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { League } from './schemas/league.schema';
import { Model } from 'mongoose';
import { LeagueDto } from './dto/league.dto';

@Injectable()
export class LeaguesService {
  private readonly logger = new Logger(LeaguesService.name);
  constructor(
    @InjectModel(League.name) private readonly leagueModel: Model<League>,
  ) {}

  public async findAll(): Promise<LeagueDto[]> {
    return this.leagueModel.find().exec();
  }
}
