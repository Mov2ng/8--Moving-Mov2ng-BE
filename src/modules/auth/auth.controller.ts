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
    const user = await authService.signup(name, email, phoneNum, password, role);
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
  const { refreshToken } = req.body;
  await authService.logout(refreshToken);
  logger.info(`[${new Date().toISOString()}] 로그아웃 성공`);
  return ApiResponse.success(res, null, "로그아웃 성공", HTTP_STATUS.OK);
});

const me = asyncWrapper(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new ApiError(
      HTTP_STATUS.AUTH_REQUIRED,
      HTTP_MESSAGE.AUTH_REQUIRED,
      HTTP_CODE.AUTH_REQUIRED
    );
  }
  const user = await authService.me(userId);
  return ApiResponse.success(res, user, "내 정보 조회 성공", HTTP_STATUS.OK);
});

export default {
  signup,
  login,
  logout,
  me,
};