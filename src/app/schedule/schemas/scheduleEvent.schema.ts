import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { IScheduleLeague, IScheduleMatch } from '../types/schedule';
import { Date, HydratedDocument } from 'mongoose';

export type ScheduleEventDocument = HydratedDocument<ScheduleEvent>;

@Schema()
export class ScheduleEvent {
  @Prop({ type: Date, required: true })
  startTime: Date;

  @Prop({ type: String, required: true })
  state: string;

  @Prop({ type: String, required: true })
  type: string;

  @Prop({ type: String, required: true })
  blockName: string;

  @Prop({ type: Object, required: true })
  league: IScheduleLeague;

  @Prop({ type: Object, required: true })
  match: IScheduleMatch;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const ScheduleEventSchema = SchemaFactory.createForClass(ScheduleEvent);
