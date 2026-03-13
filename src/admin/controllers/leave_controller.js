import {
  ApiErrorResponse,
  ApiSuccessResponse,
  SuccessResponse,
} from "../../utils/response.js";
import { LeaveModel } from "../models/leave_model.js";
import { UserModel } from "../models/user_model.js";

export const getAllLeaves = async (req, res, next) => {
  try {
    const userid = req.user.userid;

    const user = await UserModel.findByPk(userid);

    if (!user || user.role !== "admin") {
      throw new ApiErrorResponse("User not found or unauthorized", 404);
    }

    const leaves = await LeaveModel.findAll({
      order: [["createdAt", "DESC"]],
    });

    return SuccessResponse(
      res,
      new ApiSuccessResponse({
        statusCode: 200,
        data: leaves || [],
      }),
    );
  } catch (error) {
    next(error);
  }
};

export const updateLeaveStatus = async (req, res, next) => {
  try {
    const { leaveid, status } = req.body;

    if (!leaveid || !status) {
      throw new ApiErrorResponse("Leave ID and status are required", 400);
    }

    const leave = await LeaveModel.findByPk(leaveid);

    if (!leave) {
      throw new ApiErrorResponse("Leave record not found", 404);
    }

    leave.status = status;
    await leave.save();

    return SuccessResponse(
      res,
      new ApiSuccessResponse({
        statusCode: 200,
        message: `Leave ${status.toLowerCase()} successfully`,
      }),
    );
  } catch (error) {
    next(error);
  }
};

