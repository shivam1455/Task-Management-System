const bcrypt = require("bcryptjs");

async function generateHash() {
  try {
    const password = "password123";
    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);
    console.log(hash);
  } catch (error) {
    console.error("Failed to generate hash:", error.message);
    process.exit(1);
  }
}

generateHash();
