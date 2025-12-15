import express from "express";
import { setupSwagger } from "./docs/swagger";
import dotenv from "dotenv";
import "./services/discordBot";
import authRouter from "./modules/auth/auth.routes";

dotenv.config(); // .env 변수를 process.env 객체에 추가

const app = express();
app.use(express.json());
// app.use(cookieParser()); // 왜 기본 세팅할 때 이거 세팅 안한거지..??

// 모든 도메인 허용
// app.use(cors()); // 엥 이것두..?

// 라우트
app.use("/auth", authRouter);

setupSwagger(app);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on ${port}`);
});
