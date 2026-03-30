import {
  authenticationHandler,
  employeeOnly,
} from "../../middleware/verify_token.js";
import {
  addEmployeereport,
  getAllReports,
  getMyAdditionalHoursReports,
  addAdditionalHoursReport,
} from "../controllers/report_controller.js";
import express from "express";

const router = express.Router();

router.post(
  "/employee/report/add",
  authenticationHandler,
  employeeOnly,
  addEmployeereport,
);
router.post(
  "/employee/report/list",
  authenticationHandler,
  employeeOnly,
  getAllReports,
);

router.post(
  "/employee/additional-hours/add",
  authenticationHandler,
  employeeOnly,
  addAdditionalHoursReport,
);

router.post(
  "/employee/additional-hours/list",
  authenticationHandler,
  employeeOnly,
  getMyAdditionalHoursReports,
);

export default router;
