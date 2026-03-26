import { Sequelize } from "sequelize";
import { current } from "./src/config/config.js";

const dbConfig = current.database;

console.log("Database connectivity initializing with config:", {
  host: dbConfig.host,
  port: dbConfig.port,
  db_name: dbConfig.db_name,
  username: dbConfig.username,
  // Never log password!
});

if (!dbConfig.db_name || !dbConfig.host) {
  console.error("CRITICAL CONFIGURATION ERROR: Database name or host missing. Please check Vercel environment variables.");
}

export const sequelize = new Sequelize(
  dbConfig.db_name || "",
  dbConfig.username || "",
  dbConfig.password || "",
  {
    host: dbConfig.host || "localhost",
    port: dbConfig.port || 3306,
    dialect: "mysql",
    timezone: "+05:30",
    logging: false,
    dialectOptions: {
      connectTimeout: 10000,
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },
);

export const connectDB = async () => {
  try {
    console.log("Database: Initiating connection attempt...");
    await sequelize.authenticate();
    console.log("Database: Connection established successfully.");
  } catch (error) {
    console.error("Database: Connection failed:", error.message);
    // Don't throw to prevent unhandled crashing, but log the error
  }
};
