import {
  authenticationHandler,
  employeeOrManager,
} from "../../middleware/verify_token.js";
import {
  addModule,
  addProject,
  assignedEmployeeProjects,
  employeeProjects,
  deleteAssignment,
} from "../controllers/project_controller.js";
import express from "express";

const router = express.Router();

router.post(
  "/employee/add-module",
  authenticationHandler,
  employeeOrManager,
  addModule,
);

router.post(
  "/employee/assined-projects",
  authenticationHandler,
  employeeOrManager,
  assignedEmployeeProjects,
);
router.post(
  "/employee/my-projects",
  authenticationHandler,
  authenticationHandler,
  employeeProjects,
);

router.post(
  "/employee/add-project",
  authenticationHandler,
  employeeOrManager,
  addProject,
);

router.post(
  "/assignments/delete",
  authenticationHandler,
  employeeOrManager,
  deleteAssignment,
);

export default router;
