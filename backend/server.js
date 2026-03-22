const express = require("express");
const cors = require("cors");
require("dotenv").config({ override: true });
const { sequelize } = require("./models");
const exportDatabaseToJson = require("./utils/exportDb");
const authRoutes = require("./routes/auth");
const taskRoutes = require("./routes/tasks");
const userRoutes = require("./routes/users");

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 5000;
const CLIENT_URLS = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((url) => url.trim())
  .filter(Boolean);
const JSON_LIMIT = process.env.JSON_LIMIT || "1mb";
const RATE_LIMIT_WINDOW_MS = process.env.RATE_LIMIT_WINDOW_MS
  ? Number(process.env.RATE_LIMIT_WINDOW_MS)
  : 15 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = process.env.RATE_LIMIT_MAX_REQUESTS
  ? Number(process.env.RATE_LIMIT_MAX_REQUESTS)
  : 300;
const DB_SYNC = process.env.DB_SYNC !== "false";
const DB_SYNC_ALTER = process.env.DB_SYNC_ALTER
  ? process.env.DB_SYNC_ALTER === "true"
  : false;

if (process.env.NODE_ENV === "production" && !process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET must be configured in production.");
}

const rateLimitStore = new Map();

function securityHeaders(req, res, next) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-XSS-Protection", "0");
  next();
}

function basicRateLimit(req, res, next) {
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  if (!record || now > record.resetAt) {
    rateLimitStore.set(ip, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return next();
  }

  record.count += 1;
  if (record.count > RATE_LIMIT_MAX_REQUESTS) {
    const retryAfterSeconds = Math.ceil((record.resetAt - now) / 1000);
    res.setHeader("Retry-After", String(Math.max(1, retryAfterSeconds)));
    return res.status(429).json({
      success: false,
      message: "Too many requests. Please try again later.",
    });
  }

  return next();
}

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || CLIENT_URLS.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("CORS policy blocked this origin"));
    },
  })
);
app.use(securityHeaders);
app.use(express.json({ limit: JSON_LIMIT }));

// Export DB to JSON on every write request
app.use((req, res, next) => {
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    res.on('finish', () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        exportDatabaseToJson();
      }
    });
  }
  next();
});

app.use("/api", basicRateLimit);
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Server is running" });
});

app.get("/health", async (req, res) => {
  try {
    await sequelize.authenticate();
    return res.status(200).json({
      status: "ok",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(503).json({
      status: "degraded",
      database: "disconnected",
      message: "Database connection failed",
    });
  }
});

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use((error, req, res, next) => {
  if (error?.message?.includes("CORS policy blocked")) {
    return res.status(403).json({
      success: false,
      message: "Request origin is not allowed by CORS policy.",
    });
  }

  return res.status(500).json({
    success: false,
    message: "Unexpected server error.",
  });
});

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log("Database connection established.");

    if (DB_SYNC) {
      await sequelize.sync(DB_SYNC_ALTER ? { alter: true } : undefined);
      console.log(
        `Database synced (${DB_SYNC_ALTER ? "alter mode" : "safe mode"}).`
      );
    } else {
      console.log("Database sync skipped (DB_SYNC=false).");
    }

    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
      exportDatabaseToJson(); // Initial export on start
    });
  } catch (error) {
    console.error("Unable to connect to the database:", error.message);
    process.exit(1);
  }
}

startServer();
