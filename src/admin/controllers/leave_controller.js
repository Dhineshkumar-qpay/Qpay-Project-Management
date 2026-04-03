import { Sequelize } from "sequelize";
import {
  ApiErrorResponse,
  ApiSuccessResponse,
  SuccessResponse,
} from "../../utils/response.js";
import { LeaveModel } from "../models/leave_model.js";
import { UserModel } from "../models/user_model.js";
import { calculateLeaveSummary } from "../../utils/leave_utils.js";
import { AttendanceModel } from "../models/attendance_model.js";
import { Op } from "sequelize";

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

    // Sync with Attendance
    if (status === "Approved") {
      const start = new Date(leave.startdate);
      const end = new Date(leave.enddate);
      let current = new Date(start);

      while (current <= end) {
        const dateStart = new Date(current);
        dateStart.setHours(0, 0, 0, 0);
        const dateEnd = new Date(current);
        dateEnd.setHours(23, 59, 59, 999);

        const [attendance] = await AttendanceModel.findOrCreate({
          where: {
            employeeid: leave.employeeid,
            date: { [Op.between]: [dateStart, dateEnd] }
          },
          defaults: {
            employeeid: leave.employeeid,
            date: dateStart,
          }
        });

        attendance.status = leave.duration.includes("Full Day") ? "Absent" : leave.duration;
        // Preserve checkin if it's already recorded for the day
        if (!attendance.checkin || parseFloat(attendance.checkin) === 0) {
          if (attendance.status === "Absent") {
            attendance.checkin = 0.00;
            attendance.checkout = 0.00;
            attendance.workinghours = 0.00;
          }
        }
        await attendance.save();
        current.setDate(current.getDate() + 1);
      }
    } else if (status === "Rejected") {
      // If rejected, remove the "Absent" status if it was set by this leave
      const start = new Date(leave.startdate);
      const end = new Date(leave.enddate);
      let current = new Date(start);

      while (current <= end) {
        const dateStart = new Date(current);
        dateStart.setHours(0, 0, 0, 0);
        const dateEnd = new Date(current);
        dateEnd.setHours(23, 59, 59, 999);

        const attendance = await AttendanceModel.findOne({
          where: {
            employeeid: leave.employeeid,
            date: { [Op.between]: [dateStart, dateEnd] }
          }
        });

        if (attendance && (attendance.status === "Absent" || attendance.status.includes("Half Day"))) {
          // Check if there's any actually recorded time. If not, reset to Not Marked
          if (!attendance.checkin || parseFloat(attendance.checkin) === 0) {
            attendance.status = "Not Marked";
            await attendance.save();
          }
        }
        current.setDate(current.getDate() + 1);
      }
    }

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
