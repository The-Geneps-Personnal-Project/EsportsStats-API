export interface ITournaments {
    data: {
        leagues: {
            tournaments: ITournament[];
        };
    };
}

export interface ITournament {
    id: string,
    slug: string,
    startDate: string,
    endDate: string,
}