import dotenv from "dotenv";
dotenv.config();

const isProduction = process.env.NODE_ENV === "production";

export const current = {
  database: {
    db_name: isProduction ? process.env.MYSQLDATABASE : process.env.DEV_DB_NAME,

    host: isProduction ? process.env.MYSQLHOST : process.env.DEV_DB_HOST,

    username: isProduction
      ? process.env.MYSQLUSER
      : process.env.DEV_DB_USERNAME,

    password: isProduction
      ? process.env.MYSQLPASSWORD
      : process.env.DEV_DB_PASSWORD,

    port: isProduction
      ? parseInt(process.env.MYSQLPORT) || 3306
      : parseInt(process.env.DEV_DB_PORT) || 3306,
  },
};

// import dotenv from "dotenv";
// dotenv.config();

// const env =
//   process.env.NODE_ENV === "production" ? "production" : "development";

// export const development = {
//   database: {
//     db_name: process.env.DEV_DB_NAME,
//     host: process.env.DEV_DB_HOST,
//     username: process.env.DEV_DB_USERNAME,
//     password: process.env.DEV_DB_PASSWORD,
//     port: parseInt(process.env.DEV_DB_PORT) || 3306,
//   },
//   server: {
//     port: parseInt(process.env.DEV_PORT) || 3000,
//   },
// };

// export const production = {
//   database: {
//     db_name: process.env.MYSQLDATABASE,
//     host: process.env.MYSQLHOST,
//     username: process.env.MYSQLUSER,
//     password: process.env.MYSQLPASSWORD,
//     port: parseInt(process.env.MYSQLPORT) || 3306,
//   },
//   server: {
//     port: parseInt(process.env.PORT) || 3000,
//   },
// };

// export const current = env === "production" ? production : development;
// export const mode = env;
