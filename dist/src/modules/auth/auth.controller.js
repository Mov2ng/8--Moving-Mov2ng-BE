"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth_service_1 = __importDefault(require("./auth.service"));
const http_1 = require("../../constants/http");
const ApiResponse_1 = __importDefault(require("../../core/http/ApiResponse"));
const asyncWrapper_1 = require("../../utils/asyncWrapper");
const logger_1 = __importDefault(require("../../utils/logger"));
const signup = (0, asyncWrapper_1.asyncWrapper)(async (req, res) => {
    const { name, email, phoneNum, password } = req.body;
    const user = await auth_service_1.default.signup(name, email, phoneNum, password);
    logger_1.default.info(`[${new Date().toISOString()}] 회원가입 성공: ${user.email}`);
    return ApiResponse_1.default.success(res, user, "회원가입 성공", http_1.HTTP_STATUS.CREATED);
});
const login = (0, asyncWrapper_1.asyncWrapper)(async (req, res) => {
    const { email, password } = req.body;
    const user = await auth_service_1.default.login(email, password);
    logger_1.default.info(`[${new Date().toISOString()}] 로그인 성공: ${user.email}`);
    return ApiResponse_1.default.success(res, user, "로그인 성공", http_1.HTTP_STATUS.OK);
});
const logout = (0, asyncWrapper_1.asyncWrapper)(async (req, res) => {
    const { refreshToken } = req.body;
    await auth_service_1.default.logout(refreshToken);
    logger_1.default.info(`[${new Date().toISOString()}] 로그아웃 성공`);
    return ApiResponse_1.default.success(res, null, "로그아웃 성공", http_1.HTTP_STATUS.OK);
});
exports.default = {
    signup,
    login,
    logout,
};
//# sourceMappingURL=auth.controller.js.map