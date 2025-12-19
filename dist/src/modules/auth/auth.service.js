"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("../../constants/http");
const ApiError_1 = __importDefault(require("../../core/http/ApiError"));
const password_1 = require("../../core/security/password");
const jwt_1 = require("../../utils/jwt");
const auth_repository_1 = __importDefault(require("./auth.repository"));
async function signup(name, email, phoneNum, password) {
    // 이메일 중복 체크
    const existingUser = await auth_repository_1.default.findUserByEmail(email);
    if (existingUser) {
        throw new ApiError_1.default(http_1.HTTP_STATUS.BAD_REQUEST, "이미 존재하는 이메일입니다.", http_1.HTTP_CODE.BAD_REQUEST);
    }
    // 비밀번호 해싱
    const hashedPassword = await (0, password_1.hashPassword)(password);
    if (!hashedPassword) {
        throw new ApiError_1.default(http_1.HTTP_STATUS.INTERNAL_ERROR, "비밀번호 해싱에 실패했습니다.", http_1.HTTP_CODE.INTERNAL_ERROR);
    }
    // DB에 사용자 정보 저장
    const user = await auth_repository_1.default.createUser(name, email, phoneNum, hashedPassword);
    if (!user) {
        throw new ApiError_1.default(http_1.HTTP_STATUS.INTERNAL_ERROR, "사용자 생성에 실패했습니다.", http_1.HTTP_CODE.INTERNAL_ERROR);
    }
    return user;
}
async function login(email, password) {
    // 사용자 정보 조회
    const user = await auth_repository_1.default.findUserByEmail(email);
    if (!user) {
        throw new ApiError_1.default(http_1.HTTP_STATUS.NOT_FOUND, "사용자 정보를 찾을 수 없습니다.", http_1.HTTP_CODE.NOT_FOUND);
    }
    // 비밀번호 검증
    const isPasswordValid = await (0, password_1.verifyPassword)(password, user.password);
    if (!isPasswordValid) {
        throw new ApiError_1.default(http_1.HTTP_STATUS.UNAUTHORIZED, "이메일 또는 비밀번호가 일치하지 않습니다.", http_1.HTTP_CODE.UNAUTHORIZED);
    }
    const accessToken = (0, jwt_1.generateToken)({ id: user.id });
    const refreshToken = (0, jwt_1.generateRefreshToken)({ id: user.id });
    const { password: _, ...userWithoutPassword } = user;
    return { ...userWithoutPassword, accessToken, refreshToken };
}
async function logout(refreshToken) {
    // const decoded: JwtPayload = verifyToken(refreshToken);
    // if (!decoded) {
    //   throw new ApiError(
    //     HTTP_STATUS.UNAUTHORIZED,
    //     "리프레시 토큰이 유효하지 않습니다.",
    //     HTTP_CODE.UNAUTHORIZED
    //   );
    // }
    // await authRepository.updateUser(decoded.id, { refreshToken: null });
}
exports.default = {
    signup,
    login,
    logout,
};
//# sourceMappingURL=auth.service.js.map