import {
  authenticationHandler,
  employeeOrManager,
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
  employeeOrManager,
  addEmployeereport,
);
router.post(
  "/employee/report/list",
  authenticationHandler,
  employeeOrManager,
  getAllReports,
);

router.post(
  "/employee/additional-hours/add",
  authenticationHandler,
  employeeOrManager,
  addAdditionalHoursReport,
);

router.post(
  "/employee/additional-hours/list",
  authenticationHandler,
  employeeOrManager,
  getMyAdditionalHoursReports,
);

export default router;
