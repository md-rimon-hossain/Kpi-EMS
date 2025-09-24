import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import morgan from "morgan";
import { EmployeeRoutes } from "./app/modules/employees/employee.routes";
import { VacationRoutes } from "./app/modules/vacation/vacation.routes";

const app: Application = express();

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:8081",
];

app.use(cors({
  origin: function(origin, callback){
    // allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(morgan("dev"));

// ✅ Routes
app.use("/api/v1/employees", EmployeeRoutes);
app.use("/api/v1/vacation", VacationRoutes);

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Welcome to Employee Management System API" });
});

// 404 handler
app.all("*", (req: Request, res: Response) => {
  res.status(404).json({ message: "Not Found" });
});

// Error-handling middleware (must have 4 params)
// eslint-disable-next-line no-unused-vars
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

export default app;
