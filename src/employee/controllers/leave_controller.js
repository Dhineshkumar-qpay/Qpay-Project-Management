import { LeaveModel } from "../../admin/models/leave_model.js";
import { EmployeeModel } from "../../admin/models/employee_model.js";
import { AttendanceModel } from "../../admin/models/attendance_model.js";
import { Op } from "sequelize";
import {
  ApiErrorResponse,
  ApiSuccessResponse,
  SuccessResponse,
} from "../../utils/response.js";

export const applyLeave = async (req, res, next) => {
  try {
    const { leavetype, startdate, enddate, totaldays, reason } = req.body;
    const employeeid = req.user.employeeid;

    if (!leavetype || !startdate || !enddate || !totaldays || !reason) {
      throw new ApiErrorResponse("All fields are required", 400);
    }

    const employee = await EmployeeModel.findByPk(employeeid);
    if (!employee) {
      throw new ApiErrorResponse("Employee not found", 404);
    }

    const leaveRequest = await LeaveModel.create({
      employeeid,
      employeename: employee.employeename,
      leavetype,
      startdate,
      enddate,
      totaldays,
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
        existingRecord.status = "Absent";
        existingRecord.checkin = 0.00;
        existingRecord.checkout = 0.00;
        existingRecord.workinghours = 0.00;
        await existingRecord.save();
      } else {
        await AttendanceModel.create({
          employeeid,
          date: dateStart,
          status: "Absent",
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
    const employeeid = req.user.employeeid;

    const leaves = await LeaveModel.findAll({
      where: { employeeid },
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
