const bcrypt = require("bcryptjs");
require("dotenv").config();
const { User, sequelize } = require("./models");

async function seed() {
  try {
    await sequelize.sync();
    
    const adminEmail = "admin@example.com";
    const existingAdmin = await User.findOne({ where: { email: adminEmail } });
    
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      await User.create({
        name: "Admin User",
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
      });
      console.log("Admin user created: admin@example.com / admin123");
    } else {
      console.log("Admin user already exists.");
    }

    const userEmail = "user@example.com";
    const existingUser = await User.findOne({ where: { email: userEmail } });

    if (!existingUser) {
      const hashedPassword = await bcrypt.hash("user123", 10);
      await User.create({
        name: "Regular User",
        email: userEmail,
        password: hashedPassword,
        role: "user",
      });
      console.log("Regular user created: user@example.com / user123");
    } else {
      console.log("Regular user already exists.");
    }

    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
}

seed();
