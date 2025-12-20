import express, { type Request, type Response } from "express";
import cors from "cors";
import { config } from "./config/index.js";
import router from "./routers/auth.routers.js";

const app = express();

//Middleware
app.use(cors());
app.use(express.json());
app.use("/api", router);

app.listen(config.port, () => {
  console.log(`Server running  on port ${config.port}`);
});
