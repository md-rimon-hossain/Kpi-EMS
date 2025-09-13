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
exports.EmployeeRoutes = void 0;
const express_1 = require("express");
const employee_controller_1 = require("./employee.controller");
const auth_1 = require("../../middleware/auth");
const employee_model_1 = __importDefault(require("./employee.model"));
const EmployeeRoutes = (0, express_1.Router)();
exports.EmployeeRoutes = EmployeeRoutes;
EmployeeRoutes.post("/registerEmployee", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const employeeCount = yield employee_model_1.default.countDocuments();
        if (employeeCount === 0) {
            // No employees yet → allow first Admin registration
            return (0, employee_controller_1.registerEmployee)(req, res, next);
        }
        // After first Admin exists → protect route
        (0, auth_1.authMiddleware)(["Admin"])(req, res, () => (0, employee_controller_1.registerEmployee)(req, res, next));
    }
    catch (err) {
        next(err);
    }
}));
// backend: GET /api/employee/hasAdmin
EmployeeRoutes.get("/hasAdmin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const adminExists = yield employee_model_1.default.exists({ role: "Admin" });
    res.json({ adminExists: !!adminExists });
}));
EmployeeRoutes.post("/login", employee_controller_1.login);
EmployeeRoutes.get("/getUserInfo", (0, auth_1.authMiddleware)(), employee_controller_1.getUserInfo);
