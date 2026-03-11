import dotenv from "dotenv"
dotenv.config();

export const development = {
  database: {
    db_name: process.env.DEV_DB_NAME,
    host: process.env.DEV_DB_HOST,
    username: process.env.DEV_DB_USERNAME,
    password: process.env.DEV_DB_PASSWORD,
    port: process.env.DEV_DB_PORT || 3306
  },
  server: {
    port: process.env.DEV_PORT || 3000
  }
};

export const production = {
  database: {
    db_name: process.env.DB_NAME,
    host: process.env.DB_HOST,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 3306
  },
  server: {
    port: process.env.PORT || 3003
  }
};