import { assignTask, deleteTask, getAllTasks, updateTask } from "../controllers/task_controller.js";
import express from "express";
import {
  adminOnly,
  authenticationHandler,
} from "../../middleware/verify_token.js";

const router = express.Router();

router.post("/task/add", authenticationHandler, adminOnly, assignTask);
router.post("/task/list", authenticationHandler, adminOnly, getAllTasks);
router.post("/task/delete", authenticationHandler, adminOnly, deleteTask);
router.post("/task/update", authenticationHandler, adminOnly, updateTask);

export default router;
