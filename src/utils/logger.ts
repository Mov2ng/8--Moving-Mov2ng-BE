import winston from "winston";
import env from "../config/env"; // parsedEnv.data => env 명명

/**
 * Winston 기반 로그 레벨 및 포맷 설정
 * - env 모듈에서 NODE_ENV 읽어 로그 레벨 동적 결정
 * - 개발용 콘솔 출력 포맷 & 운영용 파일 출력 포맷 분리
 */
const { combine, timestamp, printf, errors } = winston.format;

// timestamp + stack(or message) + 주요 메타(path/method/statusCode)
const stackWithMetaFormat = printf((info) => {
  const { timestamp, stack, message, statusCode, path, method } = info;

  return `${timestamp} | statusCode: ${statusCode ?? "-"} | path: '${
    path ?? "-"
  }' | method: ${method ?? "-"} | ${stack || message}`;
});

// 로거 인스턴스 생성
const logger = winston.createLogger({
  // 로그 레벨(production은 info, local/development는 debug로 상세 로깅) 설정
  level: env.NODE_ENV === "production" ? "info" : "debug",

  // timestamp + stack + 주요 메타를 남기는 공통 포맷
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true }),
    stackWithMetaFormat
  ),

  // 출력 대상
  transports: [
    // 개발용: 컬러링된 콘솔 출력
    new winston.transports.Console(),

    // 운영용: 로그 파일 출력
    // new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    // new winston.transports.File({ filename: "logs/combined.log" }),
    // 그 외 원격 로깅(Sentry 등) 연동 + json 포맷 사용
  ],
});

// [선택사항] 프로레스 레벨 예외 로깅 (ex. 실서비스 운영 / 서버 원인불명 다운 / 에러 추적 시스템 구축)
// process.on("uncaughtException", (error) =>
//   logger.error("uncaughtException", error)
// );
// process.on("unhandledRejection", (reason) =>
//   logger.error("unhandledRejection", reason)
// );

export default logger;
