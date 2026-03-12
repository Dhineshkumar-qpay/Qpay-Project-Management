import dotenv from "dotenv";
dotenv.config();

const env = process.env.NODE_ENV || "development";

export const development = {
  database: {
    db_name: process.env.DEV_DB_NAME,
    host: process.env.DEV_DB_HOST,
    username: process.env.DEV_DB_USERNAME,
    password: process.env.DEV_DB_PASSWORD,
    port: process.env.DEV_DB_PORT || 3306,
  },
  server: {
    port: process.env.DEV_PORT || 3000,
  },
};

export const production = {
  database: {
    db_name: process.env.MYSQLDATABASE || process.env.DB_NAME,
    host: process.env.MYSQLHOST || process.env.DB_HOST,
    username: process.env.MYSQLUSER || process.env.DB_USERNAME,
    password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD,
    port: process.env.MYSQLPORT || process.env.DB_PORT || 3306,
  },
  server: {
    port: process.env.PORT || 3000,
  },
};

export const current = env === "production" ? production : development;

export const mode = env;
