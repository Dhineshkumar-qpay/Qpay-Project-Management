import express from "express";
import {
    authenticationHandler,
    adminOrManagerOnly,
} from "../../middleware/verify_token.js";
import { getAllMeetings } from "../controllers/meeting_controller.js";

const router = express.Router();

router.post(
    "/admin/meeting/list",
    authenticationHandler,
    adminOrManagerOnly,
    getAllMeetings,
);

export default router;
