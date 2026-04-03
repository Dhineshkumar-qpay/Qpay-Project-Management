import {
  AttendanceModel,
  HolidayModel,
} from "../../admin/models/attendance_model.js";
import {
  ApiErrorResponse,
  ApiSuccessResponse,
  SuccessResponse,
} from "../../utils/response.js";
import { Op } from "sequelize";

export const addAttendance = async (req, res, next) => {
  try {
    const employeeid = req.user.employeeid || req.user.userid;
    const { checkin, checkout, workinghours, status } = req.body;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    let attendance = await AttendanceModel.findOne({
      where: {
        employeeid,
        date: {
          [Op.between]: [startOfDay, endOfDay],
        },
      },
    });

    if (attendance) {
      if (status) {
        if (!attendance.status || attendance.status === "Not Marked") {
          attendance.status = status;
        }
      } else if (!attendance.status || attendance.status === "Not Marked") {
        attendance.status = "Present";
      }

      if (checkin !== undefined && (!attendance.checkin || parseFloat(attendance.checkin) === 0)) {
        attendance.checkin = checkin;
      }
      if (checkout !== undefined) attendance.checkout = checkout;
      if (workinghours !== undefined) attendance.workinghours = workinghours;
      await attendance.save();
    } else {
      attendance = await AttendanceModel.create({
        employeeid,
        checkin: checkin || 0.0,
        checkout: checkout || null,
        workinghours: workinghours || null,
        status: status || "Present",
        date: new Date(),
      });
    }

    return SuccessResponse(
      res,
      new ApiSuccessResponse({
        statusCode: 200,
        message: "Attendance recorded successfully",
        data: attendance,
      }),
    );
  } catch (error) {
    next(error);
  }
};

export const getMyAttendance = async (req, res, next) => {
  try {
    const employeeid = req.user.employeeid || req.user.userid;
    const attendanceLogs = await AttendanceModel.findAll({
      where: { employeeid },
      order: [["date", "DESC"]],
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let log of attendanceLogs) {
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
        // Also calculate working hours if possible
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
    }

    return SuccessResponse(
      res,
      new ApiSuccessResponse({
        statusCode: 200,
        data: attendanceLogs,
      }),
    );
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

export const getAllHolidayCount = async (req, res, next) => {
  try {
    const allHolidays = await HolidayModel.count();
    if (allHolidays) {
      return SuccessResponse(
        res,
        new ApiSuccessResponse({
          statusCode: 200,
          data: allHolidays || 0,
        }),
      );
    }
    throw new ApiErrorResponse("Failed to fetch holiday", 400);
  } catch (error) {
    next(error);
  }
};

export const tomarrowHoliday = async (req, res, next) => {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const startOfTomorrow = new Date(tomorrow);
    startOfTomorrow.setHours(0, 0, 0, 0);

    const endOfTomorrow = new Date(tomorrow);
    endOfTomorrow.setHours(23, 59, 59, 999);

    const leaveTomarrow = await HolidayModel.findOne({
      where: {
        date: {
          [Op.between]: [startOfTomorrow, endOfTomorrow],
        },
      },
    });

    if (leaveTomarrow) {
      return SuccessResponse(
        res,
        new ApiSuccessResponse({
          statusCode: 200,
          data: leaveTomarrow,
        }),
      );
    }

    return SuccessResponse(
      res,
      new ApiSuccessResponse({
        statusCode: 200,
        data: null,
      }),
    );
  } catch (error) {
    next(error);
  }
};

export const todayAttendance = async (req, res, next) => {
  try {
    const employeeid = req.user.employeeid || req.user.userid;
    const { checkin } = req.body;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    let attendance = await AttendanceModel.findOne({
      where: {
        employeeid,
        date: {
          [Op.between]: [startOfDay, endOfDay],
        },
      },
    });

    if (!attendance) {
      attendance = await AttendanceModel.create({
        employeeid,
        checkin: checkin !== undefined ? checkin : 0.0,
        checkout: null,
        workinghours: null,
        status: checkin !== undefined ? "Present" : "Not Marked",
        date: new Date(),
      });
    } else if (checkin !== undefined) {
      if (!attendance.checkin || parseFloat(attendance.checkin) === 0) {
        attendance.checkin = checkin;
      }
      if (!attendance.status || attendance.status === "Not Marked") {
        attendance.status = "Present";
      }
      await attendance.save();
    }

    return SuccessResponse(
      res,
      new ApiSuccessResponse({
        statusCode: 200,
        message: checkin !== undefined ? "Check-in successful" : "Today's attendance checked successfully",
        data: attendance,
      }),
    );
  } catch (error) {
    next(error);
  }
};

export const checkAttendanceStatus = async (req, res, next) => {
  try {
    const employeeid = req.user.employeeid || req.user.userid;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const attendance = await AttendanceModel.findOne({
      where: {
        employeeid,
        date: {
          [Op.between]: [startOfDay, endOfDay],
        },
      },
    });

    if (
      attendance &&
      attendance.status === "Present" &&
      attendance.checkin &&
      parseFloat(attendance.checkin) !== 0
    ) {
      return SuccessResponse(
        res,
        new ApiSuccessResponse({
          statusCode: 200,
          message: "Today's check-in status",
          data: {
            status: true,
            checkin: attendance.checkin,
          },
        }),
      );
    }

    return SuccessResponse(
      res,
      new ApiSuccessResponse({
        statusCode: 200,
        message: "No check-in record found for today",
        data: {
          status: false,
        },
      }),
    );
  } catch (error) {
    next(error);
  }
};

