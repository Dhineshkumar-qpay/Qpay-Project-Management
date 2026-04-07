import { Sequelize } from "sequelize";
import {
  ApiErrorResponse,
  ApiSuccessResponse,
  SuccessResponse,
} from "../../utils/response.js";
import { LeaveModel } from "../models/leave_model.js";
import { UserModel } from "../models/user_model.js";
import { calculateLeaveSummary } from "../../utils/leave_utils.js";
import { EmployeeModel } from "../models/employee_model.js";
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
    if (!leave) throw new ApiErrorResponse("Leave record not found", 404);

    const oldStatus = leave.status;
    leave.status = status;
    await leave.save();

    // Sync with Attendance
    if (oldStatus === "Approved" && status !== "Approved") {
      await syncLeaveToAttendance({ ...leave.toJSON(), status: "Rejected" });
    } else if (status === "Approved") {
      await syncLeaveToAttendance(leave);
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
      order: [["createdAt", "DESC"]],
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

/*------------------------ Admin Admin Leave Crud ------------------------*/

const syncLeaveToAttendance = async (leave) => {
  if (leave.status === "Approved") {
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
          status: "Not Marked",
          checkin: 0.0,
          checkout: 0.0,
          workinghours: 0.0,
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
  } else {
    // If status is not approved, ensure we clear any "Absent" markers if no real work was done
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
        if (!attendance.checkin || parseFloat(attendance.checkin) === 0) {
          attendance.status = "Not Marked";
          await attendance.save();
        }
      }
      current.setDate(current.getDate() + 1);
    }
  }
};

export const adminAddLeave = async (req, res, next) => {
  try {
    const { employeeid, leavetype, duration, startdate, enddate, totaldays, reason, status } = req.body;
    let { employeename } = req.body;

    if (!employeeid || !leavetype || !duration || !startdate || !enddate || !totaldays || !reason) {
      throw new ApiErrorResponse("Missing required fields", 400);
    }

    if (!employeename) {
      const emp = await EmployeeModel.findByPk(employeeid);
      if (!emp) throw new ApiErrorResponse("Employee not found", 404);
      employeename = emp.employeename;
    }

    const leave = await LeaveModel.create({
      employeeid,
      employeename,
      leavetype,
      duration,
      startdate,
      enddate,
      totaldays,
      reason,
      status: status || "Approved",
    });

    await syncLeaveToAttendance(leave);

    return SuccessResponse(
      res,
      new ApiSuccessResponse({
        statusCode: 201,
        message: "Leave added successfully",
        data: leave,
      })
    );
  } catch (error) {
    next(error);
  }
};

export const adminUpdateLeave = async (req, res, next) => {
  try {
    const { leaveid, leavetype, duration, startdate, enddate, totaldays, reason, status } = req.body;

    if (!leaveid) throw new ApiErrorResponse("Leave ID is required", 400);

    const leave = await LeaveModel.findByPk(leaveid);
    if (!leave) throw new ApiErrorResponse("Leave not found", 404);

    // Old details for clearing attendance logs if dates/status change
    const oldLeave = { ...leave.toJSON() };

    // Update fields
    if (leavetype) leave.leavetype = leavetype;
    if (duration) leave.duration = duration;
    if (startdate) leave.startdate = startdate;
    if (enddate) leave.enddate = enddate;
    if (totaldays) leave.totaldays = totaldays;
    if (reason) leave.reason = reason;
    if (status) leave.status = status;

    await leave.save();

    // Clear old attendance status if dates changed or status changed from Approved
    await syncLeaveToAttendance({ ...oldLeave, status: "Rejected" }); // Temporarily clear old dates
    await syncLeaveToAttendance(leave); // Apply new dates/status

    return SuccessResponse(
      res,
      new ApiSuccessResponse({
        statusCode: 200,
        message: "Leave updated successfully",
        data: leave,
      })
    );
  } catch (error) {
    next(error);
  }
};

export const adminDeleteLeave = async (req, res, next) => {
  try {
    const { leaveid } = req.body;
    if (!leaveid) throw new ApiErrorResponse("Leave ID is required", 400);

    const leave = await LeaveModel.findByPk(leaveid);
    if (!leave) throw new ApiErrorResponse("Leave not found", 404);

    // Clear associated attendance status
    await syncLeaveToAttendance({ ...leave.toJSON(), status: "Rejected" });

    await leave.destroy();

    return SuccessResponse(
      res,
      new ApiSuccessResponse({
        statusCode: 200,
        message: "Leave deleted successfully",
      })
    );
  } catch (error) {
    next(error);
  }
};
