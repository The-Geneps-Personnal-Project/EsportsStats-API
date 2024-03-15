export interface ITournaments {
  data: {
    leagues: [
      {
        tournaments: ITournament[];
      },
    ];
  };
}

export interface ITournament {
  id: string;
  slug: string;
  leagueId: string;
  startDate: string;
  endDate: string;
}
