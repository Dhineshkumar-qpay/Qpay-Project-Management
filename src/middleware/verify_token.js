import { ApiErrorResponse } from "../utils/response.js";
import jwt from "jsonwebtoken";

export const authenticationHandler = async (req, res, next) => {
  let authHeader = req.headers["authorization"];

  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    throw new ApiErrorResponse("Token is required", 400);
  }

  jwt.verify(token, process.env.JWT_TOKEN, (error, user) => {
    if (error) {
      if (error.name === "TokenExpiredError") {
        return next(new ApiErrorResponse("Token expired", 401));
      }
      return next(new ApiErrorResponse("Invalid Token", 403));
    }
    req.user = user;
    next();
  });
};

export const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    throw new ApiErrorResponse("Access denied", 403);
  }
  next();
};

export const employeeOnly = (req, res, next) => {
  if (req.user.role !== "employee") {
    throw new ApiErrorResponse("Access denied", 403);
  }
  next();
};
