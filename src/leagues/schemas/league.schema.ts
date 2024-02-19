import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ILeague } from '../types/leagues';
import { HydratedDocument } from 'mongoose';

export type LeagueDocument = HydratedDocument<League>;

@Schema()
export class League implements ILeague {
  @Prop({ type: String, required: true, unique: true })
  id: string;

  @Prop({ type: String, required: true, unique: true })
  slug: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  region: string;

  @Prop({ type: String, required: true })
  image: string;

  @Prop({ type: Number, required: false })
  priority?: number;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const LeagueSchema = SchemaFactory.createForClass(League);
