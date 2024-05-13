export interface ISchedule {
  data: {
    schedule: IScheduleItem[];
  };
}

export interface IScheduleItem {
  page?: {
    older?: string;
    newer?: string;
  };
  events: IScheduleEvent[];
}

export interface IScheduleEvent {
  startTime: Date;
  state: string | null;
  type: string;
  blockName: string;
  league: IScheduleLeague;
  match: IScheduleMatch;
}

export interface IScheduleMatch {
  id: string;
  flags: Array<string>;
  teams: IScheduleTeam[];
  strategy: IScheduleStrategy;
}

export interface IScheduleTeam {
  name: string;
  code: string;
  image: string;
  result: {
    outcome: string | null;
    gameWins: number;
  };
  record: {
    wins: number;
    losses: number;
  };
}

export interface IScheduleStrategy {
  type: string;
  count: number;
}

export interface IScheduleLeague {
  name: string;
  slug: string;
}
