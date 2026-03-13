import express from "express";
import {
    authenticationHandler,
    employeeOnly,
} from "../../middleware/verify_token.js";
import {
    applyLeave,
    getEmployeeLeaves,
} from "../controllers/leave_controller.js";

const router = express.Router();

router.post(
    "/leave/apply",
    authenticationHandler,
    employeeOnly,
    applyLeave,
);

router.post(
    "/leave/list",
    authenticationHandler,
    employeeOnly,
    getEmployeeLeaves,
);

export default router;
