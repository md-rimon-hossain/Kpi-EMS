import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export default {
  PORT: process.env.PORT || 4000,
  MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017/employeeDB",
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS || 10,
};
