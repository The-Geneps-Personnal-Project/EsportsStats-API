import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ITournament } from '../types/tournaments';

export type TournamentDocument = HydratedDocument<Tournament>;

@Schema()
export class Tournament implements ITournament {
    @Prop({ type: String, required: true, unique: true })
    id: string;
    
    @Prop({ type: String, required: true, unique: true })
    slug: string;
    
    @Prop({ type: String, required: true })
    startDate: string;
    
    @Prop({ type: String, required: true })
    endDate: string;

    @Prop({ type: Date, required: true })
    createdAt: Date;

    @Prop({ type: Date, required: true })
    updatedAt: Date;
}

export const TournamentSchema = SchemaFactory.createForClass(Tournament);
