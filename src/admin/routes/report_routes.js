import {
  getAllReports,
  getTotalCounts,
  getTimeSheetSummary,
  getAllAdditionalHoursReports,
} from "../controllers/report_controller.js";
import express from "express";
import {
  adminOnly,
  adminOrManagerOnly,
  authenticationHandler,
} from "../../middleware/verify_token.js";
const router = express.Router();

router.post(
  "/admin/report-count",
  authenticationHandler,
  adminOrManagerOnly,
  getTotalCounts,
);
router.post("/report/list", authenticationHandler, adminOrManagerOnly, getAllReports);

router.post(
  "/report/summary",
  authenticationHandler,
  adminOrManagerOnly,
  getTimeSheetSummary,
);

router.post(
  "/additional-hours/list",
  authenticationHandler,
  adminOrManagerOnly,
  getAllAdditionalHoursReports,
);


export default router;
