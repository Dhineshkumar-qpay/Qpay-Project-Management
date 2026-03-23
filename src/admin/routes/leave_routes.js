import {
  adminOnly,
  authenticationHandler,
} from "../../middleware/verify_token.js";
import { getAllLeaves, getPendingRequests, getTotalRequestCounts, updateLeaveStatus } from "../controllers/leave_controller.js";
import express from "express";

const router = express.Router();

router.post("/leave/getallleaves", authenticationHandler, adminOnly, getAllLeaves);
router.post("/leave/update-status", authenticationHandler, adminOnly, updateLeaveStatus);

router.post(
  "/leave/status-count",
  authenticationHandler,
  adminOnly,
  getTotalRequestCounts,
);

router.post(
  "/leave/pending",
  authenticationHandler,
  adminOnly,
  getPendingRequests,
);

export default router;