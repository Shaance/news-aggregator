import dotenv from 'dotenv';

interface Config {
  port: number,
  refreshFrequency: string
}

function getConfig(): Config {
  dotenv.config();
  return {
    port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3001,
    refreshFrequency: process.env.REFRESH_FREQ || '*/30',
  };
}

export default getConfig();
