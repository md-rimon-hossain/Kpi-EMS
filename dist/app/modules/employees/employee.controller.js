"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserInfo = exports.login = exports.registerEmployee = void 0;
const employee_model_1 = __importDefault(require("./employee.model"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || "supersecret";
const registerEmployee = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { fullName, startJobDate, gender, photo, phone, email, address, jobTitle, joiningDate, employmentType, education, skills, role, password, } = req.body;
        // 1️⃣ Check if email already exists
        const existing = yield employee_model_1.default.findOne({ email });
        if (existing) {
            res.status(400).json({ message: "Email already registered" });
            return;
        }
        // 2️⃣ Hash password
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        // 3️⃣ Count current employees
        const employeeCount = yield employee_model_1.default.countDocuments();
        // 4️⃣ If no employee exists, first one becomes Admin automatically
        const finalRole = employeeCount === 0 ? "Admin" : role; // only first user is Admin
        // 5️⃣ Create employee
        const employee = new employee_model_1.default({
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
        yield employee.save();
        res.status(201).json({
            message: employeeCount === 0
                ? "First Admin created successfully"
                : "Employee registered successfully",
        });
    }
    catch (err) {
        if (err.name === "ValidationError") {
            res.status(400).json({ message: err.message });
            return;
        }
        next(err);
    }
});
exports.registerEmployee = registerEmployee;
const login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const employee = yield employee_model_1.default.findOne({ email });
        if (!employee) {
            res.status(400).json({ message: "Invalid email or password" });
            return;
        }
        const isMatch = yield bcrypt_1.default.compare(password, employee.password);
        if (!isMatch) {
            res.status(400).json({ message: "Invalid email or password" });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ id: employee._id, role: employee.role }, JWT_SECRET, {
            expiresIn: "7d",
        });
        res.json({ token, role: employee.role });
    }
    catch (err) {
        next(err);
    }
});
exports.login = login;
const getUserInfo = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const employee = yield employee_model_1.default.findById(req.user.id).select("-password");
        if (!employee) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.json(employee);
    }
    catch (err) {
        next(err);
    }
});
exports.getUserInfo = getUserInfo;
