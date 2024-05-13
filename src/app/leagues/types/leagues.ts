export interface ILeagues {
  data: {
    leagues: ILeague[];
  };
}

export interface ILeague {
  id: string;
  slug: string;
  name: string;
  region: string;
  image: string;
  priority?: number;
}
