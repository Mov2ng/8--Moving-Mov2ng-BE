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
const env_1 = __importDefault(require("../../config/env"));
const prisma_1 = require("../../generated/prisma");
async function signup(name, email, phoneNum, password, role) {
    if (role !== "USER" && role !== "DRIVER") {
        throw new ApiError_1.default(http_1.HTTP_STATUS.BAD_REQUEST, "role은 'USER' 또는 'DRIVER'만 가능합니다.", http_1.HTTP_CODE.BAD_REQUEST);
    }
    // role을 Role enum 타입으로 변환 (타입 단언 없이)
    const roleEnum = role === "USER" ? prisma_1.Role.USER : prisma_1.Role.DRIVER;
    // 유저 중복 체크
    const existingUser = await auth_repository_1.default.findUserByEmailAndRole(email, roleEnum);
    if (existingUser) {
        throw new ApiError_1.default(http_1.HTTP_STATUS.BAD_REQUEST, "이미 가입한 계정입니다.", http_1.HTTP_CODE.BAD_REQUEST);
    }
    // 비밀번호 해싱
    const hashedPassword = await (0, password_1.hashPassword)(password);
    if (!hashedPassword) {
        throw new ApiError_1.default(http_1.HTTP_STATUS.INTERNAL_ERROR, "비밀번호 해싱에 실패했습니다.", http_1.HTTP_CODE.INTERNAL_ERROR);
    }
    // DB에 사용자 정보 저장
    const user = await auth_repository_1.default.createUser(name, email, phoneNum, hashedPassword, roleEnum);
    if (!user) {
        throw new ApiError_1.default(http_1.HTTP_STATUS.INTERNAL_ERROR, "사용자 생성에 실패했습니다.", http_1.HTTP_CODE.INTERNAL_ERROR);
    }
    return user;
}
async function login(email, password, res, req, role) {
    // 쿠키에서 refreshToken 확인
    const refreshToken = req.cookies?.refreshToken;
    // 이미 로그인 상태인 경우 체크
    if (refreshToken) {
        try {
            // refreshToken 검증 → 성공하면 유효한 토큰이 있다는 의미 = 이미 로그인 상태
            (0, jwt_1.verifyToken)(refreshToken);
            // verifyToken이 성공했다면 이미 로그인한 상태
            throw new ApiError_1.default(http_1.HTTP_STATUS.BAD_REQUEST, "이미 로그인한 상태입니다.", http_1.HTTP_CODE.BAD_REQUEST);
        }
        catch (error) {
            // "이미 로그인 상태" 에러는 다시 throw
            if (error instanceof ApiError_1.default &&
                error.statusCode === http_1.HTTP_STATUS.BAD_REQUEST) {
                throw error;
            }
            // verifyToken이 실패한 경우 (토큰 만료/무효) → 로그인 진행 허용
            // 에러를 무시하고 로그인 로직 계속 진행
        }
    }
    // role 검증
    if (role !== "USER" && role !== "DRIVER") {
        throw new ApiError_1.default(http_1.HTTP_STATUS.BAD_REQUEST, "role은 'USER' 또는 'DRIVER'만 가능합니다.", http_1.HTTP_CODE.BAD_REQUEST);
    } // 근데 role 검증은 이미 zod schema에서 했는데도 필요함??
    // role을 Role enum 타입으로 변환 (타입 단언 없이)
    const roleEnum = role === "USER" ? prisma_1.Role.USER : prisma_1.Role.DRIVER;
    // 사용자 정보 조회
    const user = await auth_repository_1.default.findUserByEmailAndRole(email, roleEnum);
    if (!user) {
        throw new ApiError_1.default(http_1.HTTP_STATUS.NOT_FOUND, "사용자 정보를 찾을 수 없습니다.", http_1.HTTP_CODE.NOT_FOUND);
    }
    // 비밀번호 검증
    const isPasswordValid = await (0, password_1.verifyPassword)(password, user.password);
    if (!isPasswordValid) {
        throw new ApiError_1.default(http_1.HTTP_STATUS.UNAUTHORIZED, "이메일 또는 비밀번호가 일치하지 않습니다.", http_1.HTTP_CODE.UNAUTHORIZED);
    }
    const accessToken = (0, jwt_1.generateToken)({ id: user.id });
    const newRefreshToken = (0, jwt_1.generateRefreshToken)({ id: user.id });
    // refreshToken HTTP-only 쿠키에 저장
    res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true, // JS 접근 불가 (XSS 공격 방지)
        secure: env_1.default.NODE_ENV === "production", // HTTPS에서만 전송
        sameSite: "strict", // CSRF 공격 방지
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7일
    });
    const { password: _, ...userWithoutPassword } = user;
    return { ...userWithoutPassword, accessToken };
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
async function me(id) {
    const user = await auth_repository_1.default.findUserById(id);
    if (!user) {
        throw new ApiError_1.default(http_1.HTTP_STATUS.NOT_FOUND, "사용자 정보를 찾을 수 없습니다.", http_1.HTTP_CODE.NOT_FOUND);
    }
    return user;
}
exports.default = {
    signup,
    login,
    logout,
    me,
};
//# sourceMappingURL=auth.service.js.map