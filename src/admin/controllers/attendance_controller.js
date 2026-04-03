import {
  ApiErrorResponse,
  ApiSuccessResponse,
  SuccessResponse,
} from "../../utils/response.js";
import {
  AttendanceModel,
  HolidayModel,
} from "../models/attendance_model.js";
import "../../middleware/associations.js";
import { EmployeeModel } from "../models/employee_model.js";
import { UserModel } from "../models/user_model.js";
import { Op } from "sequelize";

export const getAllAttendancelogs = async (req, res, next) => {
  try {
    const { startDate, endDate, employeeid } = req.body;
    const user = req.user.userid
      ? await UserModel.findByPk(req.user.userid)
      : await EmployeeModel.findByPk(req.user.employeeid);

    if (!user) {
      throw new ApiErrorResponse("User not found", 404);
    }

    const now = new Date();
    let start, end;

    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);

      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    } else {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    }

    let whereCondition = {
      date: {
        [Op.between]: [start, end],
      },
    };

    if (employeeid && employeeid !== 0) {
      whereCondition.employeeid = employeeid;
    }

    const attendance = await AttendanceModel.findAll({
      where: whereCondition,
      include: [
        {
          model: EmployeeModel,
          attributes: ["employeeid", "employeename"],
        },
      ],
      order: [["date", "DESC"]],
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const formattedAttendance = await Promise.all(attendance.map(async (item) => {
      const { EmployeeModel, ...rest } = item.toJSON();
      const log = item;
      const logDate = new Date(log.date);
      logDate.setHours(0, 0, 0, 0);

      // Auto check-out at 2:00 PM for past Afternoon Leaves with missing checkout
      if (
        log.status === "Half Day - Afternoon" &&
        log.checkin &&
        parseFloat(log.checkin) > 0 &&
        (!log.checkout || parseFloat(log.checkout) === 0) &&
        logDate < today
      ) {
        log.checkout = 14.00;
        const inVal = parseFloat(log.checkin);
        const outVal = 14.00;
        const inTotalMins = Math.floor(inVal) * 60 + Math.round((inVal - Math.floor(inVal)) * 100);
        const outTotalMins = Math.floor(outVal) * 60 + Math.round((outVal - Math.floor(outVal)) * 100);
        if (outTotalMins > inTotalMins) {
          const diffMins = outTotalMins - inTotalMins;
          log.workinghours = parseFloat(`${Math.floor(diffMins / 60)}.${(diffMins % 60).toString().padStart(2, "0")}`);
        }
        await log.save();
      }

      return {
        ...rest,
        checkout: log.checkout,
        workinghours: log.workinghours,
        employeename: EmployeeModel?.employeename || null,
      };
    }));

    return SuccessResponse(
      res,
      new ApiSuccessResponse({
        statusCode: 200,
        data: formattedAttendance,
      }),
    );
  } catch (error) {
    next(error);
  }
};


export const getTodayAttendancelogs = async (req, res, next) => {
  try {
    const user = req.user.userid
      ? await UserModel.findByPk(req.user.userid)
      : await EmployeeModel.findByPk(req.user.employeeid);

    if (!user) {
      throw new ApiErrorResponse("User not found", 404);
    }

    const today = new Date();

    const start = new Date(today);
    start.setHours(0, 0, 0, 0);

    const end = new Date(today);
    end.setHours(23, 59, 59, 999);

    const attendance = await AttendanceModel.findAll({
      where: {
        date: {
          [Op.between]: [start, end],
        },
      },
      include: [
        {
          model: EmployeeModel,
          attributes: ["employeeid", "employeename"],
        },
      ],
      order: [["date", "DESC"]],
    });

    const formattedAttendance = attendance.map((item) => {
      const { EmployeeModel, ...rest } = item.toJSON();
      return {
        ...rest,
        employeename: EmployeeModel?.employeename || null,
      };
    });

    return SuccessResponse(
      res,
      new ApiSuccessResponse({
        statusCode: 200,
        data: formattedAttendance,
      })
    );
  } catch (error) {
    next(error);
  }
};

/*------------------------ Leave Controller ------------------------*/

export const addHoliday = async (req, res, next) => {
  try {
    const { title, date } = req.body;
    if (!title) throw new ApiErrorResponse("Title is required", 400);
    if (!date) throw new ApiErrorResponse("Date is required", 400);

    const leave = await HolidayModel.create({
      title,
      date,
      createby: req.user.userid || req.user.employeeid,
    });
    if (leave) {
      return SuccessResponse(
        res,
        new ApiSuccessResponse({
          statusCode: 200,
          message: "Holiday created Successfully",
        }),
      );
    }
    throw new ApiErrorResponse("Failed to create holiday", 400);
  } catch (error) {
    next(error);
  }
};

export const updateHoliday = async (req, res, next) => {
  try {
    const { title, date, holidayid } = req.body;
    if (!holidayid) throw new ApiErrorResponse("Holiday Id is required", 400);
    if (!title) throw new ApiErrorResponse("Title is required", 400);
    if (!date) throw new ApiErrorResponse("Date is required", 400);

    const leave = await HolidayModel.findByPk(holidayid);

    if (leave) {
      leave.title = title;
      leave.date = date;

      await leave.save();

      return SuccessResponse(
        res,
        new ApiSuccessResponse({
          statusCode: 200,
          message: "Holiday updated Successfully",
        }),
      );
    }
    throw new ApiErrorResponse("Failed to create holiday", 400);
  } catch (error) {
    next(error);
  }
};

export const deleteHoliday = async (req, res, next) => {
  try {
    const { holidayid } = req.body;

    if (!holidayid) {
      throw new ApiErrorResponse("Holiday Id is required", 400);
    }

    const deletedCount = await HolidayModel.destroy({
      where: { holidayid },
    });

    if (deletedCount > 0) {
      return SuccessResponse(
        res,
        new ApiSuccessResponse({
          statusCode: 200,
          message: "Holiday deleted successfully",
        }),
      );
    }

    throw new ApiErrorResponse("Holiday not found or already deleted", 404);
  } catch (error) {
    next(error);
  }
};

export const getAllHoliday = async (req, res, next) => {
  try {
    const allHolidays = await HolidayModel.findAll();
    if (allHolidays) {
      return SuccessResponse(
        res,
        new ApiSuccessResponse({
          statusCode: 200,
          data: allHolidays || [],
        }),
      );
    }
    throw new ApiErrorResponse("Failed to fetch holiday", 400);
  } catch (error) {
    next(error);
  }
};
export const updateAttendance = async (req, res, next) => {
  try {
    const { attendanceid, employeeid, status, date } = req.body;

    if (!status) throw new ApiErrorResponse("Status is required", 400);

    let attendance;

    if (attendanceid) {
      attendance = await AttendanceModel.findByPk(attendanceid);
    } else if (employeeid && date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      attendance = await AttendanceModel.findOne({
        where: {
          employeeid,
          date: {
            [Op.between]: [startOfDay, endOfDay],
          }
        }
      });

      if (!attendance) {
        attendance = await AttendanceModel.create({
          employeeid,
          date: startOfDay,
          status: status
        });
        return SuccessResponse(
          res,
          new ApiSuccessResponse({
            statusCode: 201,
            message: "Attendance status marked successfully",
            data: attendance,
          })
        );
      }
    } else {
      throw new ApiErrorResponse("Attendance ID, or Employee ID and Date are required", 400);
    }

    if (!attendance) {
      throw new ApiErrorResponse("Attendance not found", 404);
    }

    attendance.status = status;
    await attendance.save();

    return SuccessResponse(
      res,
      new ApiSuccessResponse({
        statusCode: 200,
        message: "Attendance status updated successfully",
        data: attendance,
      })
    );
  } catch (error) {
    next(error);
  }
};

