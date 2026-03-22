const express = require("express");
const bcrypt = require("bcryptjs");
const { User } = require("../models");
const { verifyToken, requireAdmin } = require("../middleware/authMiddleware");
const {
  isNonEmptyString,
  normalizeString,
  normalizeEmail,
  isValidEmail,
  isValidRole,
  isValidPositiveInteger,
} = require("../utils/validators");
const { sendError } = require("../utils/http");

const router = express.Router();

router.use(verifyToken, requireAdmin);

// Admin: create user
router.post("/", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const normalizedName = normalizeString(name);
    const normalizedEmail = normalizeEmail(email);
    const normalizedRole = role ? normalizeString(role) : "user";

    if (!isNonEmptyString(normalizedName)) {
      return sendError(res, 400, "name is required");
    }
    if (!isValidEmail(normalizedEmail)) {
      return sendError(res, 400, "Valid email is required");
    }
    if (!isNonEmptyString(password) || password.trim().length < 6) {
      return sendError(
        res,
        400,
        "Password is required and must be at least 6 characters"
      );
    }
    if (!isValidRole(normalizedRole)) {
      return sendError(res, 400, "role must be 'admin' or 'user'");
    }

    const existingUser = await User.findOne({ where: { email: normalizedEmail } });
    if (existingUser) {
      return sendError(res, 409, "Email already in use");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: normalizedName,
      email: normalizedEmail,
      password: hashedPassword,
      role: normalizedRole,
    });

    return res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    return sendError(res, 500, "Failed to create user", error.message);
  }
});

// Admin: list all users
router.get("/", async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ["password"] },
    });
    return res.status(200).json(users);
  } catch (error) {
    return sendError(res, 500, "Failed to fetch users", error.message);
  }
});

// Admin: get user by id
router.get("/:id", async (req, res) => {
  try {
    const userId = Number(req.params.id);
    if (!isValidPositiveInteger(userId)) {
      return sendError(res, 400, "Invalid user id");
    }

    const user = await User.findByPk(userId, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return sendError(res, 404, "User not found");
    }

    return res.status(200).json(user);
  } catch (error) {
    return sendError(res, 500, "Failed to fetch user", error.message);
  }
});

// Admin: update user
router.put("/:id", async (req, res) => {
  try {
    const userId = Number(req.params.id);
    if (!isValidPositiveInteger(userId)) {
      return sendError(res, 400, "Invalid user id");
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return sendError(res, 404, "User not found");
    }

    const { name, email, password, role } = req.body;
    const normalizedName =
      typeof name === "string" ? normalizeString(name) : user.name;
    const normalizedEmail =
      typeof email === "string" ? normalizeEmail(email) : user.email;
    const normalizedRole =
      typeof role === "string" ? normalizeString(role) : user.role;

    if (!isNonEmptyString(normalizedName)) {
      return sendError(res, 400, "name cannot be empty");
    }
    if (!isValidEmail(normalizedEmail)) {
      return sendError(res, 400, "Valid email is required");
    }
    if (!isValidRole(normalizedRole)) {
      return sendError(res, 400, "role must be 'admin' or 'user'");
    }
    if (
      typeof password === "string" &&
      password.trim().length > 0 &&
      password.trim().length < 6
    ) {
      return sendError(res, 400, "Password must be at least 6 characters when provided");
    }

    if (normalizedEmail !== user.email) {
      const existingUser = await User.findOne({ where: { email: normalizedEmail } });
      if (existingUser) {
        return sendError(res, 409, "Email already in use");
      }
    }

    const updates = {
      name: normalizedName,
      email: normalizedEmail,
      role: normalizedRole,
    };

    if (typeof password === "string" && password.trim().length > 0) {
      updates.password = await bcrypt.hash(password.trim(), 10);
    }

    await user.update(updates);

    return res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    return sendError(res, 500, "Failed to update user", error.message);
  }
});

// Admin: delete user
router.delete("/:id", async (req, res) => {
  try {
    const userId = Number(req.params.id);
    if (!isValidPositiveInteger(userId)) {
      return sendError(res, 400, "Invalid user id");
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return sendError(res, 404, "User not found");
    }

    await user.destroy();
    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    return sendError(res, 500, "Failed to delete user", error.message);
  }
});

module.exports = router;
