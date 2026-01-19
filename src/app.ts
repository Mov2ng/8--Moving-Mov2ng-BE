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
import profileRouter from "./modules/profile/profile.routes";
import uploadRouter from "./modules/upload/upload.routes";
import historyRouter from "./modules/history/history.routes";
import { SERVER } from "./constants/http";
import { checkCorsOrigin } from "./utils/origin.utils";

const app = express();

// 리버스 프록시(nginx 등) 뒤에서 실행될 때 X-Forwarded-* 헤더를 신뢰해
// 실제 클라이언트 IP와 HTTPS 여부를 올바르게 인식하도록 설정
app.set("trust proxy", 1);

app.use(express.json());
app.use(cookieParser()); // 쿠키 읽기 위한 쿠키 파싱 활성화

// CORS 설정
// - local BE: localhost만 허용
// - deployed BE: localhost + CORS_ORIGIN에 설정된 도메인 허용
const corsOptions = {
  origin: checkCorsOrigin, // 모든 환경에서 동일한 함수로 처리
  credentials: true, // 쿠키 / 인증 정보 전달 허용
};

app.use(cors(corsOptions));

app.get("/", (_, res) => {
  res.send("Mov2ng API");
});

// 라우트
app.use("/auth", authRouter);
app.use("/profile", profileRouter);
app.use("/movers", moverRouter);
app.use("/request/user", requestUserRouter);
app.use("/notice", noticeRouter);
app.use("/upload", uploadRouter);
app.use("/requests", estimateRouter);
app.use("/review", reviewRouter);
app.use("/history", historyRouter);
app.use("/request/driver", driverRequestRouter);

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
