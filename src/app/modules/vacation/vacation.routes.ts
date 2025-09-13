import { Router } from "express";

import { authMiddleware } from "../../middleware/auth";
import { downloadVacationPDF, getAllVacationRequests, getMyVacationRequests, requestVacation, updateVacationStatus } from "./vacation.controller";

const VacationRoutes = Router();


VacationRoutes.post("/createVacationRequest", authMiddleware(), requestVacation);
VacationRoutes.get("/allRequests", authMiddleware(), getAllVacationRequests);
VacationRoutes.get("/myRequests", authMiddleware(), getMyVacationRequests);
// PUT vacation status (role-based)
VacationRoutes.put("/updateStatus/:id", authMiddleware(), updateVacationStatus);
VacationRoutes.get("/:id/download", authMiddleware(), downloadVacationPDF);



export { VacationRoutes };
