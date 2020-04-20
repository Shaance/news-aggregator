import dotenv from 'dotenv';

interface Config {
  port: number,
  refreshFrequency: string,
  defaultNumberOfArticles: number
}

function getConfig(): Config {
  dotenv.config();
  return {
    port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3001,
    refreshFrequency: process.env.REFRESH_FREQ || '*/30',
    defaultNumberOfArticles: parseInt(process.env.DEFAULT_NB_ARTICLES, 10) || 25,
  };
}

export default getConfig();
