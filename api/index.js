import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

/* DB connect */
import { connectDB } from "../connection.js";

/* Associations */
import "../src/middleware/associations.js";

/* Admin Routes */
import AuthRouter from "../src/admin/routes/auth_routes.js";
import EmployeeRouter from "../src/admin/routes/employee_routes.js";
import ProjectRouter from "../src/admin/routes/project_routes.js";
import ReportRouter from "../src/admin/routes/report_routes.js";
import ClientRouter from "../src/admin/routes/client_routes.js";
import LeaveRouter from "../src/admin/routes/leave_routes.js";
import TaskRouter from "../src/admin/routes/task_routes.js";
import AttendanceRouter from "../src/admin/routes/attendance_routes.js";

/* Employee Routes */
import EmployeeAuthRouter from "../src/employee/routes/auth_routes.js";
import EmployeeProjectRouter from "../src/employee/routes/project_routes.js";
import EmployeeReportRouter from "../src/employee/routes/report_routes.js";
import EmployeeLeaveRouter from "../src/employee/routes/leave_routes.js";
import EmployeeTaskRouter from "../src/employee/routes/task_routes.js";
import EmployeeAttendanceRouter from "../src/employee/routes/attendance_routes.js";

/* Error Handler */
import globalErrorHandler from "../src/middleware/error.js";

const app = express();

/* Middleware */
app.use(cors());
app.use(express.json());

/* Root */
app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "QPAY API Running 🚀",
  });
});

/* DB Connection Middleware (Serverless-safe) */
let isConnected = false;
const ensureDBConnection = async () => {
  if (!isConnected) {
    try {
      await connectDB();
      isConnected = true;
      console.log("✅ Database connected");
    } catch (err) {
      console.error("❌ Database connection failed:", err.message);
      throw err;
    }
  }
};

app.use(async (req, res, next) => {
  try {
    await ensureDBConnection();
    next();
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Database connection failed",
    });
  }
});

/* Employee Routes */
app.use("/api/employee", EmployeeAuthRouter);
app.use("/api/employee", EmployeeProjectRouter);
app.use("/api/employee", EmployeeReportRouter);
app.use("/api/employee", EmployeeLeaveRouter);
app.use("/api/employee", EmployeeTaskRouter);
app.use("/api/employee", EmployeeAttendanceRouter);

/* Admin Routes */
app.use("/api/admin", AuthRouter);
app.use("/api/admin", EmployeeRouter);
app.use("/api/admin", ProjectRouter);
app.use("/api/admin", ReportRouter);
app.use("/api/admin", ClientRouter);
app.use("/api/admin", LeaveRouter);
app.use("/api/admin", TaskRouter);
app.use("/api/admin", AttendanceRouter);

/* Error Handler (Always Last) */
app.use(globalErrorHandler);

export default app;