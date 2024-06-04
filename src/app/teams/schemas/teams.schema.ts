import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

import { IPlayer, ITeam } from '../types/teams';

export type TeamsDocument = HydratedDocument<Team>;

@Schema()
export class Team implements ITeam {
  @Prop({ type: String, unique: true, default: null })
  id: string;

  @Prop({ type: String, default: null })
  name: string | null;

  @Prop({ type: String, default: null })
  slug: string | null;

  @Prop({ type: String, default: null })
  code: string | null;

  @Prop({ type: String, default: null })
  image: string | null;

  @Prop({ type: String, default: null })
  alternativeImage: string | null;

  @Prop({ type: String, default: null })
  backgroundImage: string | null;

  @Prop({ type: String, default: null })
  status: string;

  @Prop({ type: Object, default: { name: null, region: null } })
  homeLeague: {
    name: string;
    region: string;
  };

  @Prop({ type: Array, default: [] })
  players: IPlayer[];
}

export const TeamSchema = SchemaFactory.createForClass(Team);
