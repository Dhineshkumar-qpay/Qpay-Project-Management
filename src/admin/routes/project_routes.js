import express from "express";
import {
  addProject,
  getProjects,
  deleteProject,
  addProjectModule,
  getProjectModules,
  getProjectByModules,
  addAssignments,
  getAllAssignments,
  deleteAssignment,
  updateProjectStatus,
  updateProject,
  updateProjectModule,
  deleteProjectModule,
  updateAssignments,
} from "../controllers/project_controller.js";
import {
  adminOnly,
  adminOrManagerOnly,
  authenticationHandler,
} from "../../middleware/verify_token.js";

const router = express.Router();

router.post("/project/add", authenticationHandler, addProject);
router.post("/project/list", authenticationHandler, getProjects);
router.post("/project/delete", authenticationHandler, adminOrManagerOnly, deleteProject);
router.post("/project/update", authenticationHandler, adminOrManagerOnly, updateProject);
router.post(
  "/project/update-status",
  authenticationHandler,
  adminOrManagerOnly,
  updateProjectStatus,
);

router.post(
  "/projectmodule/add",
  authenticationHandler,
  addProjectModule,
);
router.post(
  "/projectmodule/list",
  authenticationHandler,
  getProjectModules,
);
router.post(
  "/projectmodule/update",
  authenticationHandler,
  adminOrManagerOnly,
  updateProjectModule,
);
router.post(
  "/projectmodule/delete",
  authenticationHandler,
  adminOrManagerOnly,
  deleteProjectModule,
);
router.post(
  "/projectmodule/project-modules",
  authenticationHandler,
  getProjectByModules,
);

router.post(
  "/assignments/add",
  authenticationHandler,
  adminOrManagerOnly,
  addAssignments,
);
router.post(
  "/assignments/update",
  authenticationHandler,
  adminOrManagerOnly,
  updateAssignments,
);
router.post(
  "/assignments/list",
  authenticationHandler,
  adminOrManagerOnly,
  getAllAssignments,
);
router.post(
  "/assignments/delete",
  authenticationHandler,
  adminOrManagerOnly,
  deleteAssignment,
);

export default router;
