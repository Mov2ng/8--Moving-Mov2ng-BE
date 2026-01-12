import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "./services/discordBot";
import driverRequestRouter from "./modules/request/driver/request.driver.routes";

import authRouter from "./modules/auth/auth.routes";
import moverRouter from "./modules/movers/mover.routes";
import requestUserRouter from "./modules/request/user/request.user.routes";
import env from "./config/env";
import errorMiddleware from "./middlewares/error.middleware";
import { swaggerSpec } from "./docs/swagger";
import swaggerUi from "swagger-ui-express";
import estimateRouter from "./modules/estimate/estimate.routes";
import noticeRouter from "./modules/notice/notice.routes";

const app = express();
app.use(express.json());
app.use(cookieParser()); // 쿠키 읽기 위한 쿠키 파싱 활성화

// CORS 접속 허용 주소 설정 스웨거 설정 안됨 이거 안하면
const corsData = [
  "http://localhost:3000",
  "http://localhost:3000/docs",
  "http://localhost:3000/docs/#/"
];
// CORS 설정 (개발용 전체 오리진 허용 + 쿠키 전달)
app.use(cors({ origin: corsData, credentials: true }));

app.get("/", (_, res) => {
  res.send("Mov2ng API");
});

// 라우트
app.use("/auth", authRouter);
app.use("/estimate", estimateRouter);
app.use("/movers", moverRouter);
app.use("/request/user", requestUserRouter);
app.use("/notice", noticeRouter);

app.use("/api", driverRequestRouter);

app.use(errorMiddleware);

// Swagger UI 엔드포인트
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 공통 에러 핸들러 등록
app.use(errorMiddleware);

const port = env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on ${port}`);
});
