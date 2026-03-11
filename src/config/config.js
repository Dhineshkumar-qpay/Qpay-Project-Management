import dotenv from "dotenv";

dotenv.config();

export const mode = process.env.NODE_ENV || "development";

export const development = {
  database: {
    appName: process.env.APP_NAME,
    db_name: process.env.DEV_DB_NAME,
    host: process.env.DEV_DB_HOST,
    username: process.env.DEV_DB_USERNAME,
    password: process.env.DEV_DB_PASSWORD,
    port: process.env.DEV_DB_PORT || 3306,
  },
  server: {
    port: process.env.DEV_PORT || 3000,
    mode: process.env.NODE_ENV,
  },
};

export const production = {
  database: {
    appName: process.env.APP_NAME,
    db_name: process.env.DB_NAME,
    host: process.env.DB_HOST,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 3306,
  },
  server: {
    port: process.env.PORT || 3003,
  },
};