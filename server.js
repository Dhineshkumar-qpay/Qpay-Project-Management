import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { databaseConnection, sequelize } from "./connection.js";
import "./src/middleware/associations.js";

// Controllers/Routes imports
import AuthRouter from "./src/admin/routes/auth_routes.js";
import EmployeeRouter from "./src/admin/routes/employee_routes.js";
import ProjectRouter from "./src/admin/routes/project_routes.js";
import ReportRouter from "./src/admin/routes/report_routes.js";
import ClientRouter from "./src/admin/routes/client_routes.js";
import globalErrorHandler from "./src/middleware/error.js";
import EmployeeAuthRouter from "./src/employee/routes/auth_routes.js";
import EmployeeProjectRouter from "./src/employee/routes/project_routes.js";
import EmployeeReportRouter from "./src/employee/routes/report_routes.js";
import cors from "cors";
import * as config from "./src/config/config.js";

const env = process.env.NODE_ENV || "development";
const serverConfig = env === "production" ? config.production.server : config.development.server;

const app = express();
app.use(cors());
app.use(express.json());

app.use("/uploads", express.static("uploads"));

/*  Employee Routes  */
app.use("/api", EmployeeAuthRouter);
app.use("/api", AuthRouter);

app.use("/api", EmployeeProjectRouter);
app.use("/api", EmployeeReportRouter);

/*  Admin Routes  */
app.use("/api", EmployeeRouter);
app.use("/api", ProjectRouter);
app.use("/api", ReportRouter);
app.use("/api", ClientRouter);

app.use(globalErrorHandler);

async function startServer() {
  try {
    await databaseConnection();
    await sequelize.sync();

    const PORT = serverConfig.port || process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} in ${env} mode`);
    });
  } catch (error) {
    console.error(`Server startup failed: ${error}`);
    process.exit(1);
  }
}

startServer();
