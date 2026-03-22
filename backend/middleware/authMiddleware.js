const jwt = require("jsonwebtoken");
const { sendError } = require("../utils/http");

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return sendError(res, 401, "Authorization token missing");
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "dev_secret_change_me"
    );

    req.user = decoded;
    return next();
  } catch (error) {
    return sendError(res, 401, "Invalid or expired token");
  }
}

function requireAdmin(req, res, next) {
  if (!req.user) {
    return sendError(res, 401, "Unauthorized");
  }

  if (req.user.role !== "admin") {
    return sendError(res, 403, "Admin access required");
  }

  return next();
}

module.exports = {
  verifyToken,
  requireAdmin,
};
