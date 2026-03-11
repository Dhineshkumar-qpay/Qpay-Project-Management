import { Op } from "sequelize";
import {
  ApiErrorResponse,
  ApiSuccessResponse,
  SuccessResponse,
} from "../../utils/response.js";
import { UserModel } from "../models/user_model.js";
import bcrypts from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const adminRegister = async (req, res, next) => {
  try {
    const { name, mobile, email, password, setupToken } = req.body;
    if (!setupToken || setupToken !== process.env.SETUP_TOKEN || !process.env.SETUP_TOKEN) {
      throw new ApiErrorResponse("Forbidden: Invalid or missing Setup Token", 403);
    }
    if (!name) {
      throw new ApiErrorResponse("Name required for register", 400);
    }
    if (!mobile) {
      throw new ApiErrorResponse("Mobile required for register", 400);
    }
    if (!email) {
      throw new ApiErrorResponse("Email required for register", 400);
    }
    if (!password) {
      throw new ApiErrorResponse("Password required for register", 400);
    }

    const alreadyExists = await UserModel.findOne({
      where: {
        [Op.and]: [{ email }, { mobile }],
      },
    });

    if (alreadyExists) {
      throw new ApiErrorResponse("User already exists", 400);
    }

    const hashpassword = await bcrypts.hash(password, 10);

    const user = await UserModel.create({
      name,
      mobile,
      email,
      password: hashpassword,
      role: "admin",
    });

    if (user) {
      return SuccessResponse(
        res,
        new ApiSuccessResponse({
          statusCode: 201,
          message: "Registered Successfully",
        }),
      );
    }
  } catch (error) {
    next(error);
  }
};

export const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email) throw new ApiErrorResponse("Email required for login", 400);
    if (!password)
      throw new ApiErrorResponse("Password required for login", 400);

    const user = await UserModel.findOne({ where: { email } });
    if (!user) {
      throw new ApiErrorResponse("User not found", 400);
    }

    const hashpassword = await bcrypts.compare(password, user.password);

    if (!hashpassword) {
      throw new ApiErrorResponse("Invalid Credientials", 400);
    }

    const token = jwt.sign(
      { userid: user.userid, role: user.role },
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
