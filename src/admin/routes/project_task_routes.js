import express from "express";
import {
    addProjectTask,
    getProjectTasks,
    updateProjectTask,
    deleteProjectTask,
    getTasksByModule,
} from "../controllers/project_task_controller.js";
import {
    authenticationHandler,
    adminOrManagerOnly,
} from "../../middleware/verify_token.js";

const router = express.Router();

router.post(
    "/project-task/add",
    authenticationHandler,
    adminOrManagerOnly,
    addProjectTask
);
router.post(
    "/project-task/list",
    authenticationHandler,
    adminOrManagerOnly,
    getProjectTasks
);
router.post(
    "/project-task/update",
    authenticationHandler,
    adminOrManagerOnly,
    updateProjectTask
);
router.post(
    "/project-task/delete",
    authenticationHandler,
    adminOrManagerOnly,
    deleteProjectTask
);
router.post(
    "/project-task/tasks-by-module",
    authenticationHandler,
    adminOrManagerOnly,
    getTasksByModule
);

export default router;
