import { Date } from 'mongoose';

export type ILives = {
  data: {
    schedule: {
      events: ILive[];
    };
  };
};

export type ILive = {
  id: string;
  startTime: Date;
  state: string;
  type: string;
  blockName: string;
  league: ILiveLeague;
  tournament: {
    id: string;
  };
  match: ILiveMatch;
  stream: ILiveStream[];
};

export type ILiveMatch = {
  id: string;
  teams: ILiveTeam[];
  strategy: {
    type: string;
    count: number;
  };
  games: ILiveGame[];
};

export type ILiveLeague = {
  id: string;
  slug: string;
  name: string;
  image: string;
  priority?: number;
};

export type ILiveTeam = {
  id: string;
  name: string;
  slug: string;
  code: string;
  image: string;
  result: {
    outcome: string;
    gameWins: number;
  };
  record: {
    wins: number;
    losses: number;
  };
};

export type ILiveGame = {
  id: string;
  number: number;
  state: string;
  teams: ILiveGameTeam[];
  vods: [];
};

export type ILiveGameTeam = {
  id: string;
  side: string;
};

export type ILiveStream = {
  parameter: string;
  locale: string;
  mediaLocale: {
    locale: string;
    englishName: string;
    tanslatedName: string;
  };
  provider: string;
  countries: string[];
  offset: number;
  statsStatus: string;
};
