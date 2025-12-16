import express from "express";
import { setupSwagger } from "./docs/swagger";
import cookieParser from "cookie-parser";
import "./services/discordBot";
import authRouter from "./modules/auth/auth.routes";
import env from "./config/env";
import errorMiddleware from "./middlewares/error.middleware";

const app = express();
app.use(express.json());
app.use(cookieParser()); // 쿠키 읽기 위한 쿠키 파싱 활성화

// 모든 도메인 허용
// app.use(cors()); // 엥 이것두..?

// 라우트
app.use("/auth", authRouter);

setupSwagger(app);

// 공통 에러 핸들러 등록
app.use(errorMiddleware);

const port = env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on ${port}`);
});
