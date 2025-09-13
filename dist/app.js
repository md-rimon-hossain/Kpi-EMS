"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const employee_routes_1 = require("./app/modules/employees/employee.routes");
const vacation_routes_1 = require("./app/modules/vacation/vacation.routes");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.text());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.static("public"));
app.use((0, cors_1.default)({
    origin: ["http://localhost:3000"], // or "*" if for Electron
    credentials: true
}));
app.use((0, morgan_1.default)("dev"));
// ✅ Routes
app.use("/api/v1/employees", employee_routes_1.EmployeeRoutes);
app.use("/api/v1/vacation", vacation_routes_1.VacationRoutes);
app.get("/", (req, res) => {
    res.json({ message: "Welcome to Employee Management System API" });
});
// 404 handler
app.all("*", (req, res) => {
    res.status(404).json({ message: "Not Found" });
});
// Error-handling middleware (must have 4 params)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({
        success: false,
        message: err.message || "Internal Server Error",
    });
});
exports.default = app;
