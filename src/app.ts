import express from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { config } from "./config/index.js";
import router from "./routers/index.js";
import { errorHandler } from "./middleware/error.middleware.js";

const app = express();

// Security Middleware
app.use(helmet());
app.use(
  cors({
    origin: config.nodeEnv === "production" ? config.clientUrl : "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs (increased for development)
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Çok fazla istek gönderdiniz, lütfen biraz bekleyin.",
  },
});
app.use("/api", limiter);

app.use(express.json({ limit: "10kb" }));
app.use("/api", router);

app.use(errorHandler);
app.listen(config.port, () => {
  console.log(`Server running  on port ${config.port}`);
});
