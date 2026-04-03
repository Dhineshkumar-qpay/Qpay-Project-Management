import { LeaveModel } from "../../admin/models/leave_model.js";
import { EmployeeModel } from "../../admin/models/employee_model.js";
import { AttendanceModel } from "../../admin/models/attendance_model.js";
import { calculateLeaveSummary } from "../../utils/leave_utils.js";
import { Op } from "sequelize";
import {
  ApiErrorResponse,
  ApiSuccessResponse,
  SuccessResponse,
} from "../../utils/response.js";

export const applyLeave = async (req, res, next) => {
  try {
    const { leavetype, duration, startdate, enddate, totaldays, reason } = req.body;
    const employeeid = req.user.employeeid || req.user.userid;

    if (!leavetype || !duration || !startdate || !enddate || !totaldays || !reason) {
      throw new ApiErrorResponse("All fields are required", 400);
    }

    if (leavetype !== "Sick Leave" && leavetype !== "Casual Leave" && leavetype !== "Loss of Pay") {
      throw new ApiErrorResponse("Invalid leave type", 400);
    }

    const employee = await EmployeeModel.findByPk(employeeid);
    if (!employee) {
      throw new ApiErrorResponse("Employee not found", 404);
    }

    // Check for overlap
    const overlappingLeave = await LeaveModel.findOne({
      where: {
        employeeid,
        status: { [Op.in]: ["Approved", "Pending"] },
        [Op.or]: [
          {
            startdate: { [Op.between]: [startdate, enddate] }
          },
          {
            enddate: { [Op.between]: [startdate, enddate] }
          },
          {
            [Op.and]: [
              { startdate: { [Op.lte]: startdate } },
              { enddate: { [Op.gte]: enddate } }
            ]
          }
        ]
      }
    });

    if (overlappingLeave) {
      throw new ApiErrorResponse("You have already applied for leave during this period.", 400);
    }

    // Leave balance check for CL and SL
    if (leavetype === "Casual Leave" || leavetype === "Sick Leave") {
      const summary = await calculateLeaveSummary(employeeid);
      if (leavetype === "Casual Leave") {
        if (summary.casualLeave.balance < Number(totaldays)) {
          throw new ApiErrorResponse(`Insufficient Casual Leave balance. Available: ${summary.casualLeave.balance}, Requested: ${totaldays}`, 400);
        }
      } else if (leavetype === "Sick Leave") {
        if (summary.sickLeave.balance < Number(totaldays)) {
          throw new ApiErrorResponse(`Insufficient Sick Leave balance. Available: ${summary.sickLeave.balance}, Requested: ${totaldays}`, 400);
        }
      }
    }

    const leaveRequest = await LeaveModel.create({
      employeeid,
      employeename: employee.employeename,
      leavetype,
      duration,
      startdate,
      enddate,
      totaldays: Number(totaldays),
      reason,
      status: "Pending",
      applieddate: new Date(),
    });

    // Mark attendance as Absent for the leave period
    const start = new Date(startdate);
    const end = new Date(enddate);

    let current = new Date(start);
    while (current <= end) {
      // Check if attendance already exists for this date
      const dateStart = new Date(current);
      dateStart.setHours(0, 0, 0, 0);
      const dateEnd = new Date(current);
      dateEnd.setHours(23, 59, 59, 999);

      const existingRecord = await AttendanceModel.findOne({
        where: {
          employeeid,
          date: {
            [Op.between]: [dateStart, dateEnd],
          },
        },
      });

      if (existingRecord) {
        existingRecord.status = duration.includes("Full Day") ? "Absent" : duration;
        // Preserve checkin if it's already recorded
        if (!existingRecord.checkin || parseFloat(existingRecord.checkin) === 0) {
          existingRecord.checkin = 0.00;
          existingRecord.checkout = 0.00;
          existingRecord.workinghours = 0.00;
        }
        await existingRecord.save();
      } else {
        await AttendanceModel.create({
          employeeid,
          date: dateStart,
          status: duration.includes("Full Day") ? "Absent" : duration,
          checkin: 0.00,
          checkout: 0.00,
          workinghours: 0.00,
        });
      }

      current.setDate(current.getDate() + 1);
    }

    return SuccessResponse(
      res,
      new ApiSuccessResponse({
        statusCode: 201,
        message: "Leave application submitted successfully",
        data: leaveRequest,
      }),
    );
  } catch (error) {
    next(error);
  }
};

export const getEmployeeLeaves = async (req, res, next) => {
  try {
    const employeeid = req.user.employeeid || req.user.userid;

    const leaves = await LeaveModel.findAll({
      where: { employeeid },
      order: [["createdAt", "DESC"]],
    });

    const summary = await calculateLeaveSummary(employeeid);

    return SuccessResponse(
      res,
      new ApiSuccessResponse({
        statusCode: 200,
        data: {
          summary: summary,
          leaves: leaves || [],
        },
      }),
    );
  } catch (error) {
    next(error);
  }
};
