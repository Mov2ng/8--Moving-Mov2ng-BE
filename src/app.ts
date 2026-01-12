import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "./services/discordBot";
import driverRequestRouter from "./modules/request/driver/request.driver.routes";

import authRouter from "./modules/auth/auth.routes";
import moverRouter from "./modules/movers/mover.routes";
import requestUserRouter from "./modules/request/user/request.user.routes";
import reviewRouter from "./modules/review/review.routes";
import env from "./config/env";
import errorMiddleware from "./middlewares/error.middleware";
import { swaggerSpec } from "./docs/swagger";
import swaggerUi from "swagger-ui-express";
import estimateRouter from "./modules/estimate/estimate.routes";
import userRouter from "./modules/user/user.routes";
import uploadRouter from "./modules/upload/upload.routes";
import { SERVER } from "./constants/http";

const app = express();

// 리버스 프록시(nginx 등) 뒤에서 실행될 때 X-Forwarded-* 헤더를 신뢰해
// 실제 클라이언트 IP와 HTTPS 여부를 올바르게 인식하도록 설정
app.set("trust proxy", 1);

app.use(express.json());
app.use(cookieParser()); // 쿠키 읽기 위한 쿠키 파싱 활성화

// CORS 설정
const corsOptions = {
  origin:
    env.NODE_ENV === "development" || env.NODE_ENV === "production"
      ? env.CORS_ORIGIN!.split(",").map((origin) => origin.trim()) // 개발/운영 서버: CORS_ORIGIN 사용 (필수)
      : true, // 로컬: 전체 허용
  credentials: true, // 쿠키 전달 허용
};
app.use(cors(corsOptions));

app.get("/", (_, res) => {
  res.send("Mov2ng API");
});

// 라우트
app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/estimate", estimateRouter);
app.use("/movers", moverRouter);
app.use("/request/user", requestUserRouter);
app.use("/upload", uploadRouter);
app.use("/requests", estimateRouter);
app.use("/movers", moverRouter);
app.use("/request/user", requestUserRouter);
app.use("/review", reviewRouter);

app.use("/api", driverRequestRouter);

// Swagger UI 엔드포인트
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 공통 에러 핸들러
// 상태 체크 엔드포인트
app.get("/healthz", (_, res) => {
  res.status(200).send("OK");
});

// 공통 에러 핸들러 등록
app.use(errorMiddleware);

const port = env.PORT || SERVER.DEFAULT_PORT;
app.listen(port, () => {
  console.log(`Server running on ${port}`);
});
