import express from "express";
import cors from "cors";

/* Associations */
import "./middleware/associations.js";

/* Admin Routes */
import AuthRouter from "./admin/routes/auth_routes.js";
import EmployeeRouter from "./admin/routes/employee_routes.js";
import ProjectRouter from "./admin/routes/project_routes.js";
import ReportRouter from "./admin/routes/report_routes.js";
import ClientRouter from "./admin/routes/client_routes.js";
import LeaveRouter from "./admin/routes/leave_routes.js";
import TaskRouter from "./admin/routes/task_routes.js";
import AttendanceRouter from "./admin/routes/attendance_routes.js";

/* Employee Routes */
import EmployeeAuthRouter from "./employee/routes/auth_routes.js";
import EmployeeProjectRouter from "./employee/routes/project_routes.js";
import EmployeeReportRouter from "./employee/routes/report_routes.js";
import EmployeeLeaveRouter from "./employee/routes/leave_routes.js";
import EmployeeTaskRouter from "./employee/routes/task_routes.js";
import EmployeeAttendanceRouter from "./employee/routes/attendance_routes.js";

/* Error Handler */
import globalErrorHandler from "./middleware/error.js";

const app = express();

/* Middleware */
app.use(cors());
app.use(express.json());

/* Root */
app.get("/", (req, res) => {
    res.status(200).send("QPAY API Running 🚀");
});

/* Employee Routes */
app.use("/api", EmployeeAuthRouter);
app.use("/api", EmployeeProjectRouter);
app.use("/api", EmployeeReportRouter);
app.use("/api", EmployeeLeaveRouter);
app.use("/api", EmployeeTaskRouter);
app.use("/api", EmployeeAttendanceRouter);

/* Admin Routes */
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

export default app;
