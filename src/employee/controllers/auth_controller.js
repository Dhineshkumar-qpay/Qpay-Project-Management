import { EmployeeModel } from "../../admin/models/employee_model.js";
import {
  ApiErrorResponse,
  ApiSuccessResponse,
  SuccessResponse,
} from "../../utils/response.js";
import bcrypts from "bcrypt";
import jwt from "jsonwebtoken";

export const employeeLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email) throw new ApiErrorResponse("Email required for login", 400);
    if (!password)
      throw new ApiErrorResponse("Password required for login", 400);

    const user = await EmployeeModel.findOne({ where: { email } });
    if (!user) {
      throw new ApiErrorResponse("User not found", 404);
    }

    if (user.status === "Inactive") {
      throw new ApiErrorResponse("User is inactive", 401);
    }

    const matchPassword = await bcrypts.compare(password, user.password);
    if (!matchPassword) {
      throw new ApiErrorResponse("Invalid credinetials", 404);
    }

    const token = jwt.sign(
      { employeeid: user.employeeid, role: "employee" },
      process.env.JWT_TOKEN,
      {
        expiresIn: "30d",
      },
    );
    return SuccessResponse(
      res,
      new ApiSuccessResponse({
        statusCode: 200,
        data: {
          message: "Login Successfully",
          token: token,
        },
      }),
    );
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const employeeid = req.user.employeeid;
    const employee = await EmployeeModel.findOne({
      where: { employeeid },
      attributes: { exclude: ["password"] },
    });
    if (employee) {
      return SuccessResponse(
        res,
        new ApiSuccessResponse({
          statusCode: 200,
          data: employee,
        }),
      );
    }
    throw new ApiErrorResponse("Employee not found", 401);
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const employeeid = req.user.employeeid;

    if (!employeeid) {
      throw new ApiErrorResponse("Employee ID missing in token", 401);
    }

    const { employeename, mobilenumber, dateofbirth } = req.body;

    const employee = await EmployeeModel.findOne({
      where: { employeeid: parseInt(employeeid) },
    });

    if (!employee) {
      throw new ApiErrorResponse("Employee not found", 404);
    }

    const profileImage = req.file
      ? `/uploads/${req.file.filename}`
      : employee.profile;

    await employee.update({
      employeename: employeename ?? employee.employeename,
      mobilenumber: mobilenumber ?? employee.mobilenumber,
      profile: profileImage,
      dateofbirth: dateofbirth ?? employee.dateofbirth,
    });

    const updatedProfile = await EmployeeModel.findOne({
      where: { employeeid },
      attributes: { exclude: ["password"] },
    });

    return SuccessResponse(
      res,
      new ApiSuccessResponse({
        statusCode: 200,
        message: "Profile updated successfully",
        data: updatedProfile,
      }),
    );
  } catch (error) {
    next(error);
  }
};

export const getTodayBirthday = async (req, res, next) => {
  try {
    const employee = await EmployeeModel.findByPk(req.user.employeeid);

    if (!employee) {
      throw new ApiErrorResponse("Employee not found", 404);
    }

    const targetDate = req.body?.date ? new Date(req.body.date) : new Date();

    if (isNaN(targetDate.getTime())) {
      throw new ApiErrorResponse("Invalid date provided", 400);
    }

    const month = targetDate.getMonth() + 1;
    const day = targetDate.getDate();

    if (!employee.dateofbirth) {
      return SuccessResponse(
        res,
        new ApiSuccessResponse({
          statusCode: 200,
          message: "Date of birth not available",
          data: false,
        }),
      );
    }

    const dob = new Date(employee.dateofbirth);

    const isBirthday = dob.getMonth() + 1 === month && dob.getDate() === day;

    return SuccessResponse(
      res,
      new ApiSuccessResponse({
        statusCode: 200,
        data: isBirthday,
      }),
    );
  } catch (error) {
    next(error);
  }
};
