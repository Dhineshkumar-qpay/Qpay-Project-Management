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
  authenticationHandler,
} from "../../middleware/verify_token.js";

const router = express.Router();

router.post("/project/add", authenticationHandler, addProject);
router.post("/project/list", authenticationHandler, adminOnly, getProjects);
router.post("/project/delete", authenticationHandler, adminOnly, deleteProject);
router.post("/project/update", authenticationHandler, adminOnly, updateProject);
router.post(
  "/project/update-status",
  authenticationHandler,
  adminOnly,
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
  adminOnly,
  getProjectModules,
);
router.post(
  "/projectmodule/update",
  authenticationHandler,
  adminOnly,
  updateProjectModule,
);
router.post(
  "/projectmodule/delete",
  authenticationHandler,
  adminOnly,
  deleteProjectModule,
);
router.post(
  "/projectmodule/project-modules",
  authenticationHandler,
  adminOnly,
  getProjectByModules,
);

router.post(
  "/assignments/add",
  authenticationHandler,
  adminOnly,
  addAssignments,
);
router.post(
  "/assignments/update",
  authenticationHandler,
  adminOnly,
  updateAssignments,
);
router.post(
  "/assignments/list",
  authenticationHandler,
  adminOnly,
  getAllAssignments,
);
router.post(
  "/assignments/delete",
  authenticationHandler,
  adminOnly,
  deleteAssignment,
);

export default router;
