import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { HydratedDocument } from 'mongoose';

import { ILiveLeague, ILiveStream, ILiveMatch } from '../types/live';

export type LiveDocument = HydratedDocument<Live>;

@Schema()
export class Live {
  @Prop({ type: String, required: true })
  id: string;

  @Prop({ type: Date, required: true })
  startTime: Date;

  @Prop({ type: String, required: true })
  state: string;

  @Prop({ type: String, required: true })
  type: string;

  @Prop({ type: String })
  blockName: string;

  @Prop({ type: Object, default: null })
  league: ILiveLeague;

  @Prop({ type: Object, default: null })
  match: ILiveMatch;

  @Prop({ type: Array, default: [] })
  stream: ILiveStream[];

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const LiveSchema = SchemaFactory.createForClass(Live);
