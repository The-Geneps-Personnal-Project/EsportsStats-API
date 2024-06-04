export interface ITeams {
  data: {
    teams: ITeam[];
  };
}

export interface ITeam {
  id: string;
  name: string | null;
  slug: string | null;
  code: string | null;
  image: string | null;
  alternativeImage: string | null;
  backgroundImage: string | null;
  status: string | null;
  homeLeague?: {
    name?: string;
    region?: string;
  };
  players?: IPlayer[];
}

export interface IPlayer {
  id: string;
  summonerName: string;
  firstName: string;
  lastName: string;
  image: string;
  role: string;
}
