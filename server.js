import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

import "./src/middleware/associations.js";

import AuthRouter from "./src/admin/routes/auth_routes.js";
import EmployeeRouter from "./src/admin/routes/employee_routes.js";
import ProjectRouter from "./src/admin/routes/project_routes.js";
import ReportRouter from "./src/admin/routes/report_routes.js";
import ClientRouter from "./src/admin/routes/client_routes.js";

import EmployeeAuthRouter from "./src/employee/routes/auth_routes.js";
import EmployeeProjectRouter from "./src/employee/routes/project_routes.js";
import EmployeeReportRouter from "./src/employee/routes/report_routes.js";

import globalErrorHandler from "./src/middleware/error.js";

import { current, mode } from "./src/config/config.js";
import { connectDB } from "./connection.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
  res.send("QPAY API Running");
});

/* Employee Routes */
app.use("/api", EmployeeAuthRouter);
app.use("/api", EmployeeProjectRouter);
app.use("/api", EmployeeReportRouter);

/* Admin Routes */
app.use("/api", AuthRouter);
app.use("/api", EmployeeRouter);
app.use("/api", ProjectRouter);
app.use("/api", ReportRouter);
app.use("/api", ClientRouter);

app.use(globalErrorHandler);

const startServer = async () => {
  try {
    await connectDB();

    const PORT = process.env.PORT || current.server.port || 3000;

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT} (${mode})`);
    });
  } catch (error) {
    console.error("Server failed to start:", error);
    process.exit(1);
  }
};

startServer();