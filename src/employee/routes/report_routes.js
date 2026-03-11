import {
  authenticationHandler,
  employeeOnly,
} from "../../middleware/verify_token.js";
import { addEmployeereport, getAllReports } from "../controllers/report_controller.js";
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

export default router;
