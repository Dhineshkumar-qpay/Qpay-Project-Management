import { Sequelize } from "sequelize";
import * as config from "../Qpay-Master/src/config/config.js";

const env = config.mode;

const { database } =
  env === "production" ? config.production : config.development;

const sequelize = new Sequelize(
  database.db_name,
  database.username,
  database.password,
  {
    host: database.host,
    dialect: "mysql",
    logging: env === "development" ? console.log : false,
    pool:
      env === "production"
        ? { max: 10, min: 0, acquire: 30000, idle: 10000 }
        : undefined,
  }
);

const databaseConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log(`Database connected successfully in ${env} mode`);
  } catch (error) {
    console.error(`Database connection failed in ${env} mode`, error);
  }
};

export { sequelize, databaseConnection };