import express from "express";
import {
    authenticationHandler,
    employeeOrManager,
} from "../../middleware/verify_token.js";
import {
    applyLeave,
    getEmployeeLeaves,
} from "../controllers/leave_controller.js";

const router = express.Router();

router.post(
    "/leave/apply",
    authenticationHandler,
    employeeOrManager,
    applyLeave,
);

router.post(
    "/leave/list",
    authenticationHandler,
    employeeOrManager,
    getEmployeeLeaves,
);

export default router;
