import express from "express";
import {
  authenticationHandler,
  employeeOrManager,
} from "../../middleware/verify_token.js";
import {
  addMeeting,
  getEmployeeMeetings,
} from "../controllers/meeting_controller.js";

const router = express.Router();

router.post(
  "/employee/meeting/add",
  authenticationHandler,
  employeeOrManager,
  addMeeting,
);

router.post(
  "/employee/meeting/list",
  authenticationHandler,
  employeeOrManager,
  getEmployeeMeetings,
);

export default router;
