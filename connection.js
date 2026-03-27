import { Sequelize } from "sequelize";
import { current } from "./src/config/config.js";

export const sequelize = current.database.db_name
  ? new Sequelize(
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
    }
  )
  : new Sequelize('sqlite::memory:', { logging: false });

export const connectDB = async () => {
  try {
    if (!current.database.db_name) {
      throw new Error("MySQL environment variables (MYSQLDATABASE, etc.) are missing. Using in-memory fallback.");
    }
    await sequelize.authenticate();
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection failed:", error.message);
  }
};