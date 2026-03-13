import {
  adminOnly,
  authenticationHandler,
} from "../../middleware/verify_token.js";
import { getAllLeaves, updateLeaveStatus } from "../controllers/leave_controller.js";
import express from "express";

const router = express.Router();

router.post("/leave/getallleaves", authenticationHandler, adminOnly, getAllLeaves);
router.post("/leave/update-status", authenticationHandler, adminOnly, updateLeaveStatus);

export default router;