import { Sequelize } from "sequelize";
import * as config from "./src/config/config.js";

const env = process.env.NODE_ENV || "development";

const dbConfig =
  env === "production"
    ? config.production.database
    : config.development.database;
const { db_name, username, password, host } = dbConfig;

const sequelize = new Sequelize(db_name, username, password, {
  host: host,
  dialect: "mysql",
  logging: env === "development" ? console.log : false,
  pool:
    env === "production"
      ? { max: 10, min: 0, acquire: 30000, idle: 10000 }
      : undefined,
});

const databaseConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log(`Database connected successfully in ${env} mode`);
  } catch (error) {
    console.error(`Database connection failed in ${env} mode`, error);
  }
};

export { sequelize, databaseConnection };
