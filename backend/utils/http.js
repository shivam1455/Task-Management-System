function sendError(res, statusCode, message, details) {
  const payload = {
    success: false,
    message,
  };

  if (details && process.env.NODE_ENV !== "production") {
    payload.details = details;
  }

  return res.status(statusCode).json(payload);
}

module.exports = {
  sendError,
};
