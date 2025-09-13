import { RequestHandler } from "express";
import Employee from "./employee.model";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AuthRequest } from "../../middleware/auth";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export const registerEmployee: RequestHandler = async (req, res, next) => {
  try {
    const {
      fullName,
      startJobDate,
      gender,
      photo,
      phone,
      email,
      address,
      jobTitle,
      joiningDate,
      employmentType,
      education,
      skills,
      role,
      password,
    } = req.body;

    // 1️⃣ Check if email already exists
    const existing = await Employee.findOne({ email });
    if (existing) {
      res.status(400).json({ message: "Email already registered" });
      return;
    }

    // 2️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3️⃣ Count current employees
    const employeeCount = await Employee.countDocuments();

    // 4️⃣ If no employee exists, first one becomes Admin automatically
    const finalRole = employeeCount === 0 ? "Admin" : role; // only first user is Admin

    // 5️⃣ Create employee
    const employee = new Employee({
      fullName,
      startJobDate,
      gender,
      photo,
      phone,
      email,
      address,
      jobTitle,
      joiningDate,
      employmentType,
      education,
      skills,
      role: finalRole,
      password: hashedPassword,
    });

    await employee.save();

    res.status(201).json({
      message:
        employeeCount === 0
          ? "First Admin created successfully"
          : "Employee registered successfully",
    });
  } catch (err: any) {
    if (err.name === "ValidationError") {
      res.status(400).json({ message: err.message });
      return;
    }
    next(err);
  }
};

export const login: RequestHandler = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const employee = await Employee.findOne({ email });
    if (!employee) {
      res.status(400).json({ message: "Invalid email or password" });
      return;
    }

    const isMatch = await bcrypt.compare(password, employee.password);
    if (!isMatch) {
      res.status(400).json({ message: "Invalid email or password" });
      return;
    }

    const token = jwt.sign(
      { id: employee._id, role: employee.role },
      JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    res.json({ token, role: employee.role });
  } catch (err) {
    next(err);
  }
};

export const getUserInfo: RequestHandler = async (
  req: AuthRequest,
  res,
  next,
) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const employee = await Employee.findById(req.user.id).select("-password");
    if (!employee) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json(employee);
  } catch (err) {
    next(err);
  }
};
