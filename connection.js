import { Sequelize } from "sequelize";
import { current } from "./src/config/config.js";

const dbConfig = current.database;

export const sequelize = new Sequelize(
  dbConfig.db_name,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: "mysql",
    timezone: "+05:30",
    logging: false,
  },
);

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection failed:", error.message);
  }
};
