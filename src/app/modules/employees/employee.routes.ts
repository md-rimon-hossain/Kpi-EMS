import { Router } from "express";
import { login, getUserInfo, registerEmployee } from "./employee.controller";
import { authMiddleware } from "../../middleware/auth";
import Employee from "./employee.model";

const EmployeeRoutes = Router();

EmployeeRoutes.post("/registerEmployee", async (req, res, next) => {
  try {
    const employeeCount = await Employee.countDocuments();

    if (employeeCount === 0) {
      // No employees yet → allow first Admin registration
      return registerEmployee(req, res, next);
    }

    // After first Admin exists → protect route
    authMiddleware(["Admin"])(req, res, () => registerEmployee(req, res, next));
  } catch (err) {
    next(err);
  }
});
// backend: GET /api/employee/hasAdmin
EmployeeRoutes.get("/hasAdmin", async (req, res) => {
  const adminExists = await Employee.exists({ role: "Admin" });
  res.json({ adminExists: !!adminExists });
});

EmployeeRoutes.post("/login", login);
EmployeeRoutes.get("/getUserInfo", authMiddleware(), getUserInfo);

export { EmployeeRoutes };
