"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("../../constants/http");
/**
 * 응답 객체 표준화
 */
class ApiResponse {
    /**
     * 성공 응답 반환
     * @param res - Express Response 객체
     * @param data - 응답 데이터
     * @param message - 사용자에게 보여줄 메시지 (기본: HTTP_MESSAGE.SUCCESS)
     * @param statusCode - HTTP 상태 코드 (기본: 200 OK)
     * @returns Express Response 객체
     */
    static success(res, data, message = http_1.HTTP_MESSAGE.OK, statusCode = http_1.HTTP_STATUS.OK, meta) {
        const response = { success: true, message, data };
        if (meta)
            response.meta = meta;
        return res.status(statusCode).json(response);
    }
}
exports.default = ApiResponse;
//# sourceMappingURL=ApiResponse.js.map