import { type Request, type Response, type NextFunction } from "express";
import { ZodError } from "zod";

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("Error:", error);

  if (error instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Validation hatasi",
      errors: error.issues.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      })),
    });
  }

  if (error.code === "P2002") {
    return res.status(409).json({
      success: false,
      message: "Bu kayit zaten mevcut",
    });
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Sunucu hatasi",
  });
};
