"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
const env_1 = __importDefault(require("../config/env")); // parsedEnv.data => env 명명
/**
 * Winston 기반 로그 레벨 및 포맷 설정
 * - env 모듈에서 NODE_ENV 읽어 로그 레벨 동적 결정
 * - 개발용 콘솔 출력 포맷 & 운영용 파일 출력 포맷 분리
 */
const { combine, timestamp, printf, colorize } = winston_1.default.format;
// 필드 문자열화 포맷팅 함수
const logFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} ${level}: ${message}`;
});
// 로거 인스턴스 생성
const logger = winston_1.default.createLogger({
    // 로그 레벨(production은 info, dev/test는 debug로 상세 로깅) 설정
    level: env_1.default.NODE_ENV === "production" ? "info" : "debug",
    // 타임스탬프와 logFormat 조합해 기본 포맷 설정
    format: env_1.default.NODE_ENV === "production"
        ? combine(timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), winston_1.default.format.json())
        : combine(timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), colorize(), printf(({ timestamp, level, message }) => {
            return `${timestamp} ${level}: ${message}`;
        })),
    // 출력 대상
    transports: [
        // 개발용: 컬러링된 콘솔 출력
        new winston_1.default.transports.Console({
            format: combine(colorize(), logFormat),
        }),
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
exports.default = logger;
//# sourceMappingURL=logger.js.map