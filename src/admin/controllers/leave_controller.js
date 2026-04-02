import { Sequelize } from "sequelize";
import {
  ApiErrorResponse,
  ApiSuccessResponse,
  SuccessResponse,
} from "../../utils/response.js";
import { LeaveModel } from "../models/leave_model.js";
import { UserModel } from "../models/user_model.js";
import { calculateLeaveSummary } from "../../utils/leave_utils.js";

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

    // Calculate summaries for unique employees in the list
    const employeeIds = [...new Set(leaves.map((l) => l.employeeid))];
    const summaries = {};
    for (const id of employeeIds) {
      summaries[id] = await calculateLeaveSummary(id);
    }

    const leavesWithSummary = leaves.map((leave) => {
      const leaveData = leave.toJSON();
      return {
        ...leaveData,
        employeeSummary: summaries[leave.employeeid] || null,
      };
    });

    return SuccessResponse(
      res,
      new ApiSuccessResponse({
        statusCode: 200,
        data: leavesWithSummary || [],
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

export const getTotalRequestCounts = async (req, res, next) => {
  try {
    const counts = await LeaveModel.findAll({
      attributes: [
        "status",
        [Sequelize.fn("COUNT", Sequelize.col("status")), "count"],
      ],
      group: ["status"],
      raw: true,
    });

    const formattedAttendanceCounts = {
      total: 0,
      pending: 0,
      rejected: 0,
      approved: 0,
    };

    counts.forEach((item) => {
      formattedAttendanceCounts.total += parseInt(item.count);
      if (item.status === "Pending")
        formattedAttendanceCounts.pending = parseInt(item.count);
      if (item.status === "Approved")
        formattedAttendanceCounts.approved = parseInt(item.count);
      if (item.status === "Rejected")
        formattedAttendanceCounts.rejected = parseInt(item.count);
    });

    return SuccessResponse(
      res,
      new ApiSuccessResponse({
        statusCode: 200,
        data: formattedAttendanceCounts,
      }),
    );
  } catch (error) {
    next(error);
  }
};

export const getPendingRequests = async (req, res, next) => {
  try {
    const pendingResults = await LeaveModel.findAll({
      where: {
        status: "Pending",
      },
    });

    return SuccessResponse(
      res,
      new ApiSuccessResponse({
        statusCode: 200,
        data: pendingResults,
      }),
    );
  } catch (error) {
    next(error);
  }
};
