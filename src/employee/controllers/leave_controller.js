import { LeaveModel } from "../../admin/models/leave_model.js";
import { EmployeeModel } from "../../admin/models/employee_model.js";
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
