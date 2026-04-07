import {
  adminOnly,
  adminOrManagerOnly,
  authenticationHandler,
} from "../../middleware/verify_token.js";
import { adminAddLeave, adminDeleteLeave, adminUpdateLeave, getAllLeaves, getPendingRequests, getTotalRequestCounts, updateLeaveStatus } from "../controllers/leave_controller.js";
import express from "express";

const router = express.Router();

router.post("/leave/getallleaves", authenticationHandler, adminOrManagerOnly, getAllLeaves);
router.post("/leave/update-status", authenticationHandler, adminOrManagerOnly, updateLeaveStatus);

router.post("/leave/status-count", authenticationHandler, adminOrManagerOnly, getTotalRequestCounts);
router.post("/leave/pending", authenticationHandler, adminOrManagerOnly, getPendingRequests);

router.post("/leave/add", authenticationHandler, adminOnly, adminAddLeave);
router.post("/leave/update", authenticationHandler, adminOnly, adminUpdateLeave);
router.post("/leave/delete", authenticationHandler, adminOnly, adminDeleteLeave);

export default router;