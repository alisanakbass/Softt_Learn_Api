import express from "express";
import cors from "cors";
import { config } from "./config/index.js";
import router from "./routers/index.js";
import { errorHandler } from "./middleware/error.middleware.js";

const app = express();

//Middleware
app.use(cors());
app.use(express.json());
app.use("/api", router);

app.use(errorHandler);
app.listen(config.port, () => {
  console.log(`Server running  on port ${config.port}`);
});
