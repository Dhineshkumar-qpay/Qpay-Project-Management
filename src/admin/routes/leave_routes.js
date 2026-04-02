import {
  adminOnly,
  adminOrManagerOnly,
  authenticationHandler,
} from "../../middleware/verify_token.js";
import { getAllLeaves, getPendingRequests, getTotalRequestCounts, updateLeaveStatus } from "../controllers/leave_controller.js";
import express from "express";

const router = express.Router();

router.post("/leave/getallleaves", authenticationHandler, adminOrManagerOnly, getAllLeaves);
router.post("/leave/update-status", authenticationHandler, adminOrManagerOnly, updateLeaveStatus);

router.post(
  "/leave/status-count",
  authenticationHandler,
  adminOrManagerOnly,
  getTotalRequestCounts,
);

router.post(
  "/leave/pending",
  authenticationHandler,
  adminOrManagerOnly,
  getPendingRequests,
);

export default router;