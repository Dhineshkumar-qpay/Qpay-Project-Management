import "dotenv/config";

import express from "express";
import cors from "cors";

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

/* DB connect */
import { connectDB } from "../connection.js";

const app = express();

/* Middleware */
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

/* Root */
app.get("/", (req, res) => {
  res.status(200).json({
    message: "QPAY API Running 🚀",
  });
});

/* Routes */
app.use("/api", EmployeeAuthRouter);
app.use("/api", EmployeeProjectRouter);
app.use("/api", EmployeeReportRouter);
app.use("/api", EmployeeLeaveRouter);
app.use("/api", EmployeeTaskRouter);
app.use("/api", EmployeeAttendanceRouter);

app.use("/api", AuthRouter);
app.use("/api", EmployeeRouter);
app.use("/api", ProjectRouter);
app.use("/api", ReportRouter);
app.use("/api", ClientRouter);
app.use("/api", LeaveRouter);
app.use("/api", TaskRouter);
app.use("/api", AttendanceRouter);

/* Error Handler */
app.use(globalErrorHandler);

/* DB connect */
connectDB().catch((err) => {
  console.log("Initial database connection failed:", err.message);
});

/* Export */
export default app;