import {
  getAllReports,
  getTotalCounts,
  getTimeSheetSummary,
} from "../controllers/report_controller.js";
import express from "express";
import {
  adminOnly,
  authenticationHandler,
} from "../../middleware/verify_token.js";
const router = express.Router();

router.post(
  "/admin/report-count",
  authenticationHandler,
  adminOnly,
  getTotalCounts,
);
router.post("/report/list", authenticationHandler, adminOnly, getAllReports);

router.post(
  "/report/summary",
  authenticationHandler,
  adminOnly,
  getTimeSheetSummary,
);

export default router;
