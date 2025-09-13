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
exports.downloadVacationPDF = exports.updateVacationStatus = exports.getMyVacationRequests = exports.getAllVacationRequests = exports.requestVacation = void 0;
const vacation_model_1 = __importDefault(require("./vacation.model"));
const employee_model_1 = __importDefault(require("../employees/employee.model"));
const pdfkit_1 = __importDefault(require("pdfkit"));
// Employee submits a vacation request
const requestVacation = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const { startDate, endDate, reason } = req.body;
        if (!startDate || !endDate || !reason) {
            res
                .status(400)
                .json({ message: "Start date, end date, and reason are required" });
            return;
        }
        // ✅ Check if user already has a pending or reviewed request
        const existingRequest = yield vacation_model_1.default.findOne({
            employee: req.user.id,
            status: { $in: ["Pending", "Reviewed"] },
        });
        if (existingRequest) {
            res.status(400).json({
                message: "You already have a vacation request that is Pending or Reviewed. Please wait until it is approved or rejected before submitting a new request.",
            });
            return;
        }
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (end < start) {
            res.status(400).json({ message: "End date cannot be before start date" });
            return;
        }
        const numberOfDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        // ✅ Determine initial status based on role
        let initialStatus = "Pending";
        if (req.user.role === "Chief Instructor" ||
            req.user.role === "Principal") {
            initialStatus = "Reviewed";
        }
        const request = new vacation_model_1.default({
            employee: req.user.id,
            startDate: start,
            endDate: end,
            numberOfDays,
            reason,
            status: initialStatus,
        });
        yield request.save();
        res.status(201).json({
            message: "Vacation request submitted successfully",
            request,
        });
    }
    catch (err) {
        next(err);
    }
});
exports.requestVacation = requestVacation;
const getAllVacationRequests = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        // Find logged-in employee's role
        const employee = yield employee_model_1.default.findById(req.user.id);
        if (!employee) {
            res.status(404).json({ message: "Employee not found" });
            return;
        }
        let requests;
        if (employee.role === "Principal") {
            // Principal: see all vacation requests that have been reviewed
            requests = yield vacation_model_1.default.find({ status: "Reviewed" })
                .populate("employee", "fullName email role")
                .sort({ createdAt: -1 });
        }
        else if (employee.role === "Chief Instructor") {
            // Chief Instructor: see all pending requests
            requests = yield vacation_model_1.default.find({ status: "Pending" })
                .populate("employee", "fullName email role")
                .sort({ createdAt: -1 });
        }
        else {
            res.status(403).json({
                message: "Forbidden: you are not allowed to access this route",
            });
            return;
        }
        res.json(requests);
    }
    catch (err) {
        next(err);
    }
});
exports.getAllVacationRequests = getAllVacationRequests;
const getMyVacationRequests = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        // Find all vacation requests belonging to the logged-in employee
        const requests = yield vacation_model_1.default.find({ employee: req.user.id })
            .populate("employee", "fullName email jobTitle") // optional: show employee details
            .sort({ createdAt: -1 }); // latest first
        res.json({ requests });
    }
    catch (err) {
        next(err);
    }
});
exports.getMyVacationRequests = getMyVacationRequests;
const updateVacationStatus = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const { status, startDate, endDate } = req.body;
        const requestId = req.params.id;
        const employee = yield employee_model_1.default.findById(req.user.id);
        if (!employee) {
            res.status(404).json({ message: "Employee not found" });
            return;
        }
        const request = yield vacation_model_1.default.findById(requestId);
        if (!request) {
            res.status(404).json({ message: "Vacation request not found" });
            return;
        }
        // Helper to calculate number of days
        const calculateDays = (start, end) => {
            const startD = new Date(start);
            const endD = new Date(end);
            const diffTime = endD.getTime() - startD.getTime();
            return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        };
        // Update dates if provided
        if (startDate)
            request.startDate = new Date(startDate);
        if (endDate)
            request.endDate = new Date(endDate);
        // Auto-calculate numberOfDays
        if (request.startDate && request.endDate) {
            const days = calculateDays(request.startDate.toISOString(), request.endDate.toISOString());
            if (days > 21) {
                res.status(400).json({ message: "Vacation cannot exceed 21 days" });
                return;
            }
            request.numberOfDays = days;
        }
        // Chief Instructor
        if (employee.role === "Chief Instructor") {
            if (request.status !== "Pending") {
                res.status(400).json({ message: "Cannot review this request" });
                return;
            }
            if (status && status !== "Reviewed" && status !== "Rejected") {
                res.status(400).json({ message: "Chief Instructor can only set Reviewed or Rejected" });
                return;
            }
            if (status)
                request.status = status;
            request.reviewedBy = employee._id;
        }
        // Principal
        else if (employee.role === "Principal") {
            if (request.status !== "Reviewed") {
                res.status(400).json({ message: "Cannot approve this request yet" });
                return;
            }
            if (status && status !== "Accepted" && status !== "Rejected") {
                res.status(400).json({ message: "Principal can only set Accepted or Rejected" });
                return;
            }
            if (status)
                request.status = status;
            request.approvedBy = employee._id;
            // Update employee vacation totals if accepted
            if (status === "Accepted") {
                const vacationEmployee = yield employee_model_1.default.findById(request.employee);
                if (vacationEmployee) {
                    vacationEmployee.vacationTaken += request.numberOfDays;
                    vacationEmployee.vacationRemaining = vacationEmployee.totalVacation - vacationEmployee.vacationTaken;
                    yield vacationEmployee.save();
                }
            }
        }
        else {
            res.status(403).json({ message: "Forbidden: You cannot update this request" });
            return;
        }
        yield request.save(); // persists startDate, endDate, numberOfDays, and status
        res.json({ message: "Vacation request updated", request });
    }
    catch (err) {
        next(err);
    }
});
exports.updateVacationStatus = updateVacationStatus;
// GET /vacations/:id/download
const downloadVacationPDF = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const vacation = yield vacation_model_1.default.findById(id).populate("employee");
        if (!vacation) {
            res.status(404).json({ message: "Vacation request not found" });
            return;
        }
        if (vacation.employee._id.toString() !== userId && req.user.role !== "Admin") {
            res.status(403).json({ message: "Not authorized to download this request" });
            return;
        }
        if (vacation.status !== "Accepted") {
            res.status(400).json({ message: "PDF is only available for accepted requests" });
            return;
        }
        const doc = new pdfkit_1.default({ margin: 50, size: "A4" });
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="VacationRequest-${vacation._id}.pdf"`);
        doc.pipe(res);
        // 🎨 Header banner
        doc.rect(0, 0, doc.page.width, 80).fill("#4F46E5");
        doc.fillColor("#FFFFFF").fontSize(24).text("Vacation Request Confirmation", 50, 30);
        doc.moveDown(3);
        // Employee Info Box
        doc.fillColor("#000").fontSize(14).text("Employee Information", { underline: true });
        doc.moveDown(0.5);
        doc
            .fontSize(12)
            .fillColor("#1F2937")
            .text(`Name: ${vacation.employee.fullName}`, { continued: false })
            .text(`Email: ${vacation.employee.email}`)
            .text(`Phone: ${vacation.employee.phone || "N/A"}`)
            .text(`Job Title: ${vacation.employee.jobTitle}`)
            .text(`Role: ${vacation.employee.role}`)
            .moveDown();
        // Vacation Info Box with subtle background
        doc.rect(doc.x - 5, doc.y - 5, doc.page.width - 100, 100).fillOpacity(0.05).fill("#4F46E5").fillOpacity(1);
        doc.moveDown(0.5);
        doc.fillColor("#111827").fontSize(14).text("Vacation Details", { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(12)
            .text(`Start Date: ${vacation.startDate.toDateString()}`)
            .text(`End Date: ${vacation.endDate.toDateString()}`)
            .text(`Number of Days: ${vacation.numberOfDays}`)
            .text(`Reason: ${vacation.reason}`)
            .text(`Status: ${vacation.status}`)
            .moveDown();
        // Footer with line
        doc.moveDown(2);
        doc.strokeColor("#E5E7EB").lineWidth(1).moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).stroke();
        doc.moveDown(0.5);
        doc.fontSize(10).fillColor("#6B7280")
            .text("Generated by Employee Management System", { align: "center" })
            .moveDown(0.2)
            .text(`Date: ${new Date().toLocaleDateString()}`, { align: "center" });
        doc.end();
    }
    catch (err) {
        next(err);
    }
});
exports.downloadVacationPDF = downloadVacationPDF;
