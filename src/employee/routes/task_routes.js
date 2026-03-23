import {
  authenticationHandler,
  employeeOnly,
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
  employeeOnly,
  updateTaskStatus,
);
router.post(
  "/employee/task/list",
  authenticationHandler,
  employeeOnly,
  getEmployeeTask,
);
router.post(
  "/employee/task/pending",
  authenticationHandler,
  employeeOnly,
  getEmployeePendingTasks,
);

export default router;
