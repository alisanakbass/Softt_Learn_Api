import express, { type Request, type Response } from "express";
import cors from "cors";
import { config } from "./config/index.js";

const app = express();
const router = express.Router();

//Middleware
app.use(cors());
app.use(express.json());

// Routes
router.get("/api", (req: Request, res: Response) => {
  res.status(200).json({ message: "API is working!" });
});

// Router'ı app'e bağla
app.use(router);

app.listen(config.port, () => {
  console.log(`Server running  on port ${config.port}`);
});
