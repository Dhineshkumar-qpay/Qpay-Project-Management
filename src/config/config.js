import dotenv from "dotenv";
dotenv.config();

const env = process.env.NODE_ENV || "development";

export const development = {
  database: {
    db_name: process.env.DEV_DB_NAME,
    host: process.env.DEV_DB_HOST,
    username: process.env.DEV_DB_USERNAME,
    password: process.env.DEV_DB_PASSWORD,
    port: process.env.DEV_DB_PORT,
  },
  server: {
    port: process.env.DEV_PORT || 3000,
  },
};

export const production = {
  database: {
    db_name: process.env.MYSQLDATABASE,
    host: process.env.MYSQLHOST,
    username: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    port: process.env.MYSQLPORT,
  },
  server: {
    port: process.env.PORT || 3000,
  },
};

export const current =
  env === "production" ? production : development;

export const mode = env;