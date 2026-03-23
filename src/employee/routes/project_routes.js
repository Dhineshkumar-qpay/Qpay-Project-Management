import {
  authenticationHandler,
  employeeOnly,
} from "../../middleware/verify_token.js";
import {
  addModule,
  addProject,
  assignedEmployeeProjects,
  employeeProjects
} from "../controllers/project_controller.js";
import express from "express";

const router = express.Router();

router.post(
  "/employee/add-module",
  authenticationHandler,
  employeeOnly,
  addModule,
);

router.post(
  "/employee/assined-projects",
  authenticationHandler,
  employeeOnly,
  assignedEmployeeProjects,
);
router.post(
  "/employee/my-projects",
  authenticationHandler,
  employeeOnly,
  employeeProjects,
);

router.post(
  "/employee/add-project",
  authenticationHandler,
  employeeOnly,
  addProject,
);

export default router;
