"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VacationRoutes = void 0;
const express_1 = require("express");
const auth_1 = require("../../middleware/auth");
const vacation_controller_1 = require("./vacation.controller");
const VacationRoutes = (0, express_1.Router)();
exports.VacationRoutes = VacationRoutes;
VacationRoutes.post("/createVacationRequest", (0, auth_1.authMiddleware)(), vacation_controller_1.requestVacation);
VacationRoutes.get("/allRequests", (0, auth_1.authMiddleware)(), vacation_controller_1.getAllVacationRequests);
VacationRoutes.get("/myRequests", (0, auth_1.authMiddleware)(), vacation_controller_1.getMyVacationRequests);
// PUT vacation status (role-based)
VacationRoutes.put("/updateStatus/:id", (0, auth_1.authMiddleware)(), vacation_controller_1.updateVacationStatus);
VacationRoutes.get("/:id/download", (0, auth_1.authMiddleware)(), vacation_controller_1.downloadVacationPDF);
