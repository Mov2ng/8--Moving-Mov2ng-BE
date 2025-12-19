"use strict";
/**
 * HTTP 관련 상수 정의 파일
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HTTP_CODE = exports.HTTP_MESSAGE = exports.HTTP_STATUS = void 0;
// 상태 코드
exports.HTTP_STATUS = {
    // 2xx Success
    OK: 200, // 요청 성공(가장 일반적)
    CREATED: 201, // 리소스 생성 성공 (POST 응답)
    ACCEPTED: 202, // 비동기 작업 접수됨 (자주 사용되진 않지만 실무에서 가끔 존재)
    NO_CONTENT: 204, // 응답 본문 없음(삭제 성공 DELETE 등)
    // 3xx Redirection
    MOVED_PERMANENTLY: 301, // 영구적 리다이렉트
    FOUND: 302, // 임시 리다이렉트(가장 자주 사용)
    NOT_MODIFIED: 304, // 캐시 관련, 프론트 요청에서 매우 자주 일어남
    // 4xx Client Error
    BAD_REQUEST: 400, // 요청 형식 오류(유효성 검증 실패)
    UNAUTHORIZED: 401, // 인증 필요(로그인 안 됨)
    FORBIDDEN: 403, // 권한 없음(로그인 했지만 권한 부족)
    NOT_FOUND: 404, // 리소스 없음
    METHOD_NOT_ALLOWED: 405, // 메서드 허용 안 됨 (예: POST만 허용된 API에 GET 요청)
    CONFLICT: 409, // 리소스 충돌(회원가입 시 중복 이메일 등)
    UNPROCESSABLE_ENTITY: 422, // 형식은 맞지만 의미적으로 처리 불가(유효성 세분화)
    TOO_MANY_REQUESTS: 429, // Rate limit 초과(보안/API 제한에서 실무 활용)
    // 5xx Server Error
    INTERNAL_ERROR: 500, // 서버 내부 오류(가장 빈번)
    BAD_GATEWAY: 502, // 프록시/게이트웨이 오류
    SERVICE_UNAVAILABLE: 503, // 서버 과부하, 점검 등
    GATEWAY_TIMEOUT: 504, // 타 서버 응답 지연
    // 도메인 상태코드
    // Auth
    AUTH_INVALID_CREDENTIALS: 401,
    AUTH_INVALID_TOKEN: 401,
    AUTH_EXPIRED_TOKEN: 401,
    AUTH_REQUIRED: 401,
    AUTH_FAILED: 401,
    // User
    USER_EMAIL_EXISTS: 409,
    USER_NOT_FOUND: 404,
    // Validation (입력값 오류는 400)
    VALIDATION_REQUIRED_EMAIL: 400,
    VALIDATION_REQUIRED_PASSWORD: 400,
    VALIDATION_FORMAT_EMAIL: 400,
};
/**
 * 상태 메시지
 */
exports.HTTP_MESSAGE = {
    // 2xx Success
    OK: "요청이 정상적으로 처리되었습니다.", // 200
    CREATED: "리소스가 성공적으로 생성되었습니다.", // 201
    ACCEPTED: "요청이 접수되었으며 처리 중입니다.", // 202
    NO_CONTENT: "요청은 성공했으나 반환할 데이터가 없습니다.", // 204
    // 3xx Redirection
    MOVED_PERMANENTLY: "요청하신 리소스가 영구적으로 이동되었습니다.", // 301
    FOUND: "요청하신 리소스가 다른 위치로 일시적으로 이동되었습니다.", // 302
    NOT_MODIFIED: "리소스에 변경 사항이 없습니다.", // 304
    // 4xx Client Error
    BAD_REQUEST: "요청 형식이 올바르지 않습니다.", // 400
    UNAUTHORIZED: "인증이 필요합니다.", // 401
    FORBIDDEN: "접근 권한이 없습니다.", // 403
    NOT_FOUND: "요청하신 리소스를 찾을 수 없습니다.", // 404
    METHOD_NOT_ALLOWED: "지원하지 않는 요청 방식입니다.", // 405
    CONFLICT: "리소스 충돌이 발생했습니다.", // 409
    UNPROCESSABLE_ENTITY: "요청을 처리할 수 없습니다.", // 422
    TOO_MANY_REQUESTS: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.", // 429
    // 5xx Server Error
    INTERNAL_ERROR: "서버 내부 오류가 발생했습니다.", // 500
    BAD_GATEWAY: "서버 게이트웨이 오류가 발생했습니다.", // 502
    SERVICE_UNAVAILABLE: "현재 서버를 사용할 수 없습니다.", // 503
    GATEWAY_TIMEOUT: "서버 응답 시간이 초과되었습니다.", // 504
    // 도메인 상태 메세지
    // Auth
    AUTH_INVALID_CREDENTIALS: "이메일 또는 비밀번호가 일치하지 않습니다.",
    AUTH_INVALID_TOKEN: "유효하지 않은 토큰입니다.",
    AUTH_EXPIRED_TOKEN: "토큰이 만료되었습니다. 다시 로그인해주세요.",
    AUTH_REQUIRED: "로그인이 필요한 서비스입니다.",
    AUTH_FAILED: "인증에 실패했습니다. 다시 시도해주세요.",
    // User
    USER_EMAIL_EXISTS: "이미 사용 중인 이메일입니다.",
    USER_NOT_FOUND: "해당 사용자를 찾을 수 없습니다.",
    // Validation
    VALIDATION_REQUIRED_EMAIL: "이메일은 필수 입력값입니다.",
    VALIDATION_REQUIRED_PASSWORD: "비밀번호는 필수 입력값입니다.",
    VALIDATION_FORMAT_EMAIL: "올바른 이메일 형식이 아닙니다.",
};
/**
 * 비즈니스 에러 코드 (프론트 식별용)
 */
exports.HTTP_CODE = {
    // 공통
    BAD_REQUEST: "BAD_REQUEST",
    UNAUTHORIZED: "UNAUTHORIZED",
    FORBIDDEN: "FORBIDDEN",
    NOT_FOUND: "NOT_FOUND",
    INTERNAL_ERROR: "INTERNAL_ERROR",
    // Auth
    AUTH_INVALID_CREDENTIALS: "AUTH_INVALID_CREDENTIALS",
    AUTH_INVALID_TOKEN: "AUTH_INVALID_TOKEN",
    AUTH_EXPIRED_TOKEN: "AUTH_EXPIRED_TOKEN",
    AUTH_REQUIRED: "AUTH_REQUIRED",
    AUTH_FAILED: "AUTH_FAILED",
    // User
    USER_EMAIL_EXISTS: "USER_EMAIL_EXISTS",
    USER_NOT_FOUND: "USER_NOT_FOUND",
    // Validation
    VALIDATION_REQUIRED_EMAIL: "VALIDATION_REQUIRED_EMAIL",
    VALIDATION_REQUIRED_PASSWORD: "VALIDATION_REQUIRED_PASSWORD",
    VALIDATION_FORMAT_EMAIL: "VALIDATION_FORMAT_EMAIL",
};
//# sourceMappingURL=http.js.map