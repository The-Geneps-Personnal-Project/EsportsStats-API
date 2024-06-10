export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  database: {
    uri: process.env.MONGO_URI,
  },
  environment: process.env.NODE_ENV,
  leagueApiKey: process.env.LEAGUE_API_KEY,
  leagues: {
    frequency: process.env.LEAGUES_FREQUENCY || 24,
  },
  tournaments: {
    frequency: process.env.TOURNAMENTS_FREQUENCY || 24,
  },
  schedule: {
    frequency: process.env.SCHEDULE_FREQUENCY || 60,
  },
  teams: {
    frequency: process.env.TEAMS_FREQUENCY || 24,
  },
  live: {
    frequency: process.env.LIVE_FREQUENCY || 2,
  },
});
