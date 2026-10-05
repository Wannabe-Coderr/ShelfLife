function notFoundHandler(req, res, next) {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.status = 404;
  next(error);
}

function errorHandler(error, req, res, next) {
  const statusCode = error.status || 500;
  const message = error.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    message
  });
}

module.exports = { notFoundHandler, errorHandler };
