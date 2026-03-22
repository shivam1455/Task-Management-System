const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models");
const {
  isNonEmptyString,
  normalizeString,
  normalizeEmail,
  isValidEmail,
  isValidRole,
} = require("../utils/validators");
const { sendError } = require("../utils/http");

const router = express.Router();

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || "dev_secret_change_me",
    { expiresIn: "7d" }
  );
}

router.post("/register", async (req, res) => {
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

    if (normalizedRole !== "user") {
      return sendError(res, 403, "Admin accounts must be created by an existing admin.");
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

    const token = generateToken(user);

    return res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return sendError(res, 500, "Registration failed", error.message);
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!isValidEmail(normalizedEmail)) {
      return sendError(res, 400, "Valid email is required");
    }

    if (!isNonEmptyString(password)) {
      return sendError(res, 400, "password is required");
    }

    const user = await User.findOne({ where: { email: normalizedEmail } });
    if (!user) {
      return sendError(res, 401, "Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return sendError(res, 401, "Invalid credentials");
    }

    const token = generateToken(user);

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return sendError(res, 500, "Login failed", error.message);
  }
});

module.exports = router;
