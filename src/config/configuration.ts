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
});
