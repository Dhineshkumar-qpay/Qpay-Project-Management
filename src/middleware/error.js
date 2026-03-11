const globalErrorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const status = err.status || "error";
  const message = err.message || "Internal Server Error";

  if (process.env.NODE_ENV === "development") {
    res.status(statusCode).json({
      status,
      message,
      stack: err.stack,
      error: err,
    });
  } else {
    res.status(statusCode).json({
      status,
      message,
    });
  }
};

export default globalErrorHandler;
