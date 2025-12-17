import express from "express";
import cors from "cors";
import { setupSwagger } from "./docs/swagger";
import cookieParser from "cookie-parser";
import "./services/discordBot";
import authRouter from "./modules/auth/auth.routes";
import moverRouter from "./modules/movers/mover.routes";
import env from "./config/env";
import errorMiddleware from "./middlewares/error.middleware";

const app = express();
app.use(express.json());
app.use(cookieParser()); // 쿠키 읽기 위한 쿠키 파싱 활성화

// CORS 설정 (개발용 전체 오리진 허용 + 쿠키 전달)
app.use(cors({ origin: true, credentials: true })); 

// 라우트
app.use("/auth", authRouter);
app.use("/movers", moverRouter);

setupSwagger(app);

// 공통 에러 핸들러 등록
app.use(errorMiddleware);

const port = env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on ${port}`);
});
