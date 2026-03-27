import { Sequelize } from "sequelize";
import { current } from "./src/config/config.js";

export const sequelize = new Sequelize(
  current.database.db_name,
  current.database.username,
  current.database.password,
  {
    host: current.database.host,
    port: current.database.port,
    dialect: "mysql",
    timezone: "+05:30",
    logging: false,
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
