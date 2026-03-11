import {
  authenticationHandler,
  employeeOnly,
} from "../../middleware/verify_token.js";
import { employeeProjects } from "../controllers/project_controller.js";
import express from "express";

const router = express.Router();

router.post(
  "/employee/my-projects",
  authenticationHandler,
  employeeOnly,
  employeeProjects,
);

export default router;
