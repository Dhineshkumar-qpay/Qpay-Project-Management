import dotenv from "dotenv";
dotenv.config();

// Auto-detect production if PORT exists (standard for Railway)
const env = process.env.NODE_ENV === "production" || process.env.PORT ? "production" : "development";

export const development = {
  database: {
    db_name: process.env.DEV_DB_NAME || "qpay_project_management",
    host: process.env.DEV_DB_HOST || "localhost",
    username: process.env.DEV_DB_USERNAME || "root",
    password: process.env.DEV_DB_PASSWORD || "",
    port: parseInt(process.env.DEV_DB_PORT) || 3306,
  },
  server: {
    port: parseInt(process.env.DEV_PORT) || 3000,
  },
};

export const production = {
  database: {
    db_name: process.env.MYSQLDATABASE || process.env.DB_NAME || "railway",
    host: process.env.MYSQLHOST || process.env.DB_HOST || "localhost",
    username: process.env.MYSQLUSER || process.env.DB_USERNAME || "root",
    password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || "",
    port: parseInt(process.env.MYSQLPORT || process.env.DB_PORT) || 3306,
  },
  server: {
    port: parseInt(process.env.PORT) || 3000,
  },
};

export const current = env === "production" ? production : development;
export const mode = env;
