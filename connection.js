import { Sequelize } from "sequelize";
import * as config from "./src/config/config.js";

const env = process.env.NODE_ENV || "development";

const dbConfig =
  env === "production"
    ? config.production.database
    : config.development.database;


const { db_name, username, password, host, port } = dbConfig;

const sequelize = new Sequelize(db_name, username, password, {
  host: host,
  port: port,
  dialect: "mysql",
  logging: env === "development" ? console.log : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 60000,
    idle: 10000,
  },
});


const databaseConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log(`Database connected successfully in ${env} mode`);
  } catch (error) {
    console.error(`Database connection failed in ${env} mode`, error);
    process.exit(1);
  }
};

export { sequelize, databaseConnection };