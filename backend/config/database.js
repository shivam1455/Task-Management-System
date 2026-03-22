const { Sequelize } = require("sequelize");

const isSqlite = process.env.DB_DIALECT === "sqlite";

const sequelize = isSqlite
  ? new Sequelize({
      dialect: "sqlite",
      storage: process.env.DB_STORAGE || "./database.sqlite",
      logging: false,
    })
  : new Sequelize(
      process.env.DB_NAME || "task_manager",
      process.env.DB_USER || "root",
      process.env.DB_PASSWORD || process.env.DB_PASS || "",
      {
        host: process.env.DB_HOST || "localhost",
        port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
        dialect: "mysql",
        logging: false,
      }
    );

module.exports = sequelize;
