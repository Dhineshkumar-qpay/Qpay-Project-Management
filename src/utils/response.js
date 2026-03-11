class ApiErrorResponse extends Error {
  constructor(message = "Something went wrong", statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.status = statusCode >= 400 && statusCode < 500 ? "failure" : "error";
    this.success = false;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ApiSuccessResponse {
  constructor({ statusCode = 200, message = null, data = null } = {}) {
    this.statusCode = statusCode;
    if (message !== null && message !== undefined) {
      this.message = message;
    }
    if (data !== null && data !== undefined) {
      this.data = data;
    }
  }
}

const SuccessResponse = (res, apiResponse = new ApiSuccessResponse()) => {
  const { statusCode, message, data } = apiResponse;

  if (typeof statusCode !== "number" || !Number.isInteger(statusCode)) {
    throw new Error("Status code must be an integer");
  }

  return res.status(statusCode).json({
    status: "success",
    message,
    ...(data !== undefined && { data }),
  });
};

export { ApiErrorResponse, ApiSuccessResponse, SuccessResponse };
