import { Op } from "sequelize";
import { EmployeeModel } from "../models/employee_model.js";
import { UserModel } from "../models/user_model.js";
import multer from "multer";
import {
  ApiErrorResponse,
  ApiSuccessResponse,
  SuccessResponse,
} from "../../utils/response.js";
import bcrypts from "bcryptjs";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get product root path (3 levels up from this file: src/admin/controllers)
const rootDir = path.resolve(__dirname, "../../..");
const uploadDir = path.join(rootDir, "uploads");

// Ensure the upload directory exists
try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
} catch (error) {
  console.log("Could not create local uploads directory (likely in a serverless environment like Vercel). Local disk storage bypassed.");
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname),
    );
  },
});

export const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpg"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type, only JPEG and PNG are allowed!"), false);
    }
  },
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "uploads",
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});

export const profileImageUpload = multer({
  storage: cloudinaryStorage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
});

export const addEmployee = async (req, res, next) => {
  try {
    const {
      employeename,
      mobilenumber,
      email,
      password,
      designation,
      dateofbirth,
      joiningdate,
    } = req.body;

    const requiredFields = {
      employeename,
      mobilenumber,
      email,
      password,
      designation,
      dateofbirth,
      joiningdate,
    };

    for (const [fieldName, value] of Object.entries(requiredFields)) {
      if (!value) {
        throw new ApiErrorResponse(`${fieldName} is required`, 400);
      }
    }

    const profileImage = req.file
      ? (req.file.path.startsWith("http") ? req.file.path : `/uploads/${req.file.filename}`)
      : null;

    const alreadyExists = await EmployeeModel.findOne({
      where: {
        [Op.and]: [{ mobilenumber, email }],
      },
    });

    if (alreadyExists) {
      throw new ApiErrorResponse("Employee already exists", 400);
    }

    const hashedPassword = await bcrypts.hash(password, 10);

    const employee = await EmployeeModel.create({
      profile: profileImage,
      employeename,
      mobilenumber,
      email,
      password: hashedPassword,
      designation,
      dateofbirth,
      joiningdate,
      createdby: req.user.userid,
    });

    if (employee) {
      return SuccessResponse(
        res,
        new ApiSuccessResponse({
          statusCode: 201,
          message: "Employee added successfully",
          data: employee.employeeid,
        }),
      );
    }
  } catch (error) {
    next(error);
  }
};

export const updateEmployee = async (req, res, next) => {
  try {
    const {
      employeeid,
      employeename,
      mobilenumber,
      email,
      password,
      designation,
      dateofbirth,
      joiningdate,
    } = req.body;

    if (!employeeid) {
      throw new ApiErrorResponse("Employeeid required");
    }
    const existingEmployee = await EmployeeModel.findOne({
      where: { employeeid: parseInt(employeeid) },
    });

    if (!existingEmployee) {
      throw new ApiErrorResponse("Employee not found", 404);
    }

    const profileImage = req.file
      ? (req.file.path.startsWith("http") ? req.file.path : `/uploads/${req.file.filename}`)
      : existingEmployee.profile;

    let hashedPassword = existingEmployee.password;
    if (password) {
      hashedPassword = await bcrypts.hash(password, 10);
    }

    await EmployeeModel.update(
      {
        profile: profileImage,
        employeename: employeename || existingEmployee.employeename,
        mobilenumber: mobilenumber || existingEmployee.mobilenumber,
        email: email || existingEmployee.email,
        password: hashedPassword,
        designation: designation || existingEmployee.designation,
        dateofbirth: dateofbirth || existingEmployee.dateofbirth,
        joiningdate: joiningdate || existingEmployee.joiningdate,
        createdby: req.user.userid,
      },
      {
        where: { employeeid },
      },
    );

    return SuccessResponse(
      res,
      new ApiSuccessResponse({
        statusCode: 200,
        message: "Employee updated successfully",
        data: parseInt(employeeid),
      }),
    );
  } catch (error) {
    next(error);
  }
};

export const getEmployees = async (req, res, next) => {
  try {
    const admin = await UserModel.findByPk(req.user.userid);
    if (!admin) {
      throw new ApiErrorResponse("User not found");
    }

    const employees = await EmployeeModel.findAll({
      attributes: {
        exclude: ["password"],
      },
    });
    return SuccessResponse(
      res,
      new ApiSuccessResponse({
        statusCode: 200,
        message: "Employees fetched successfully",
        data: employees ?? [],
      }),
    );
  } catch (error) {
    next(error);
  }
};

export const deleteEmployee = async (req, res, next) => {
  try {
    const { employeeid } = req.body;

    if (!employeeid) {
      throw new ApiErrorResponse("Employee ID is required", 400);
    }

    const employee = await EmployeeModel.findOne({
      where: {
        employeeid,
        createdby: req.user.userid,
      },
    });

    if (!employee) {
      throw new ApiErrorResponse("Employee not found ", 404);
    }

    await employee.destroy();

    return SuccessResponse(
      res,
      new ApiSuccessResponse({
        statusCode: 200,
        message: "Employee deleted successfully",
      }),
    );
  } catch (error) {
    next(error);
  }
};

export const updateEmployeeStatus = async (req, res, next) => {
  try {
    const { employeeid } = req.body;

    if (!employeeid) {
      throw new ApiErrorResponse("Employee ID is required", 400);
    }

    const employee = await EmployeeModel.findOne({
      where: {
        employeeid,
        createdby: req.user.userid,
      },
    });

    if (employee) {
      employee.status = req.body.status;
      await employee.save();

      return SuccessResponse(
        res,
        new ApiSuccessResponse({
          statusCode: 200,
          message: "Employee status updated successfully",
        }),
      );
    }
    throw new ApiErrorResponse("Employee not found ", 404);
  } catch (error) {
    next(error);
  }
};
