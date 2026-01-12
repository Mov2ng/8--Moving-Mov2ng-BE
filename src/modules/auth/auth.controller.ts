import { Request, Response } from "express";
import authService from "./auth.service";
import { HTTP_CODE, HTTP_MESSAGE, HTTP_STATUS } from "../../constants/http";
import ApiResponse from "../../core/http/ApiResponse";
import { asyncWrapper } from "../../utils/asyncWrapper";
import logger from "../../utils/logger";
import { LoginDto, SignupDto } from "./auth.dto";
import ApiError from "../../core/http/ApiError";

const signup = asyncWrapper(
  async (req: Request<{}, {}, SignupDto>, res: Response) => {
    const { role, name, email, phoneNum, password } = req.body;
    const user = await authService.signup(
      name,
      email,
      phoneNum,
      password,
      role
    );
    logger.info(`[${new Date().toISOString()}] 회원가입 성공: ${user.email}`);
    return ApiResponse.success(res, user, "회원가입 성공", HTTP_STATUS.CREATED);
  }
);

const login = asyncWrapper(
  async (req: Request<{}, {}, LoginDto>, res: Response) => {
    const { role, email, password } = req.body;
    const user = await authService.login(email, password, res, req, role);
    logger.info(`[${new Date().toISOString()}] 로그인 성공: ${user.email}`);
    return ApiResponse.success(res, user, "로그인 성공", HTTP_STATUS.OK);
  }
);

const logout = asyncWrapper(async (req: Request, res: Response) => {
  await authService.logout(res, req);
  logger.info(`[${new Date().toISOString()}] 로그아웃 성공`);
  return ApiResponse.success(res, null, "로그아웃 성공", HTTP_STATUS.OK);
});

const refresh = asyncWrapper(async (req: Request, res: Response) => {
  const { refreshToken } = req.cookies;

  // validator에서 이미 체크하지만, 방어적 체크
  if (!refreshToken) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "리프레시 토큰이 필요합니다.",
      HTTP_CODE.BAD_REQUEST
    );
  }

  // refresh 함수가 쿠키에 refreshToken을 설정하고 accessToken만 반환
  const tokens = await authService.refresh(refreshToken, res, req);
  return ApiResponse.success(res, tokens, "토큰 갱신 성공", HTTP_STATUS.OK);
});

const me = asyncWrapper(async (req: Request, res: Response) => {
  // authMiddleware에서 이미 user 정보를 조회했으므로 DB 재조회 불필요
  if (!req.user) {
    throw new ApiError(
      HTTP_STATUS.AUTH_REQUIRED,
      HTTP_MESSAGE.AUTH_REQUIRED,
      HTTP_CODE.AUTH_REQUIRED
    );
  }
  // req.user에 이미 전체 user 정보가 있음 (password 제외)
  return ApiResponse.success(
    res,
    req.user,
    "내 정보 조회 성공",
    HTTP_STATUS.OK
  );
});

export default {
  signup,
  login,
  logout,
  refresh,
  me,
};
