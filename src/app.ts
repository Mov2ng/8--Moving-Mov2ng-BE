import express from "express";
import { setupSwagger } from "./docs/swagger";
import dotenv from "dotenv";
import "./services/discordBot";

dotenv.config(); // .env 변수를 process.env 객체에 추가

const app = express();
app.use(express.json());

setupSwagger(app);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on ${port}`);
});
