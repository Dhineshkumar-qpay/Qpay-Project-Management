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
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    dialectOptions: {
      connectTimeout: 20000,
    },
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
