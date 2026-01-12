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
import noticeRouter from "./modules/notice/notice.routes";
import userRouter from "./modules/user/user.routes";
import uploadRouter from "./modules/upload/upload.routes";
import { SERVER } from "./constants/http";
import { checkCorsOrigin } from "./utils/origin.utils";

const app = express();

// 리버스 프록시(nginx 등) 뒤에서 실행될 때 X-Forwarded-* 헤더를 신뢰해
// 실제 클라이언트 IP와 HTTPS 여부를 올바르게 인식하도록 설정
app.set("trust proxy", 1);

app.use(express.json());
app.use(cookieParser()); // 쿠키 읽기 위한 쿠키 파싱 활성화

// 로컬 환경: localhost의 모든 포트 허용
// 개발 환경: localhost의 모든 포트 자동 허용 + CORS_ORIGIN에 설정된 origin 추가
// 운영 환경: CORS_ORIGIN에 설정된 origin만 허용
const corsOptions = {
  origin:
    env.NODE_ENV === "production"
      ? env.CORS_ORIGIN // 운영 환경: 배열로 변환
        ? env.CORS_ORIGIN.split(",").map((origin) => origin.trim())
        : false // 운영인데 CORS_ORIGIN 없으면 차단
      : checkCorsOrigin, // 로컬/개발 환경: 함수로 동적 체크
  credentials: true, // 쿠키 / 인증 정보 전달 허용
};

app.use(cors(corsOptions));

app.get("/", (_, res) => {
  res.send("Mov2ng API");
});

// 라우트
app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/movers", moverRouter);
app.use("/request/user", requestUserRouter);
app.use("/notice", noticeRouter);
app.use("/upload", uploadRouter);
app.use("/requests", estimateRouter);
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
