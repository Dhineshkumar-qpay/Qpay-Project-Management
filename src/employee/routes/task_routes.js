import {
  authenticationHandler,
  employeeOrManager,
} from "../../middleware/verify_token.js";
import {
  getEmployeePendingTasks,
  getEmployeeTask,
  updateTaskStatus,
} from "../controllers/task_controller.js";
import express from "express";

const router = express.Router();

router.post(
  "/employee/task/update-status",
  authenticationHandler,
  employeeOrManager,
  updateTaskStatus,
);
router.post(
  "/employee/task/list",
  authenticationHandler,
  employeeOrManager,
  getEmployeeTask,
);
router.post(
  "/employee/task/pending",
  authenticationHandler,
  employeeOrManager,
  getEmployeePendingTasks,
);

export default router;
