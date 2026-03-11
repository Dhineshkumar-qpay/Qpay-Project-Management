import express from "express";
import { databaseConnection, sequelize } from "./connection.js";
import AuthRouter from "../Qpay-Master/src/admin/routes/auth_routes.js";
import EmployeeRouter from "../Qpay-Master/src/admin/routes/employee_routes.js";
import ProjectRouter from "../Qpay-Master/src/admin/routes/project_routes.js";
import ReportRouter from "../Qpay-Master/src/admin/routes/report_routes.js";
import ClientRouter from "../Qpay-Master/src/admin/routes/client_routes.js";
import globalErrorHandler from "./src/middleware/error.js";
import EmployeeAuthRouter from "./src/employee/routes/auth_routes.js";
import EmployeeProjectRouter from "./src/employee/routes/project_routes.js";
import EmployeeReportRouter from "./src/employee/routes/report_routes.js";
import cors from "cors";

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

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

async function startServer() {
  try {
    await databaseConnection();
    await sequelize.sync();
  } catch (error) {
    console.log(`Server connection error : ${error}`);
  }
}

startServer();
