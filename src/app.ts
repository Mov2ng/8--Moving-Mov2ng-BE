import express from "express";
import { setupSwagger } from "./docs/swagger";
import dotenv from "dotenv";
import "./services/discordBot";
import errorMiddleware from "./middlewares/error.middleware";
import driverRequestRouter from "./modules/request/driver/request.driver.routes";

dotenv.config();

const app = express();
app.use(express.json());

setupSwagger(app);

app.use("/api", driverRequestRouter);

app.use(errorMiddleware);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on ${port}`);
});
