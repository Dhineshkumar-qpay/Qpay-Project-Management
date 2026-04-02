import {
  assignTask,
  deleteTask,
  getAllTasks,
  updateTask,
  getPendingTaskCount,
} from "../controllers/task_controller.js";
import express from "express";
import {
  adminOnly,
  adminOrManagerOnly,
  authenticationHandler,
} from "../../middleware/verify_token.js";

const router = express.Router();

router.post("/task/add", authenticationHandler, adminOrManagerOnly, assignTask);
router.post(
  "/task/list",
  authenticationHandler,
  adminOrManagerOnly,
  getAllTasks,
);
router.post(
  "/task/delete",
  authenticationHandler,
  adminOrManagerOnly,
  deleteTask,
);
router.post(
  "/task/update",
  authenticationHandler,
  adminOrManagerOnly,
  updateTask,
);
router.post(
  "/task/pending-count",
  authenticationHandler,
  adminOrManagerOnly,
  getPendingTaskCount,
);

export default router;
