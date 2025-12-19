import { Request, Response } from "express";
import authService from "./auth.service";
import { HTTP_STATUS } from "../../constants/http";
import ApiResponse from "../../core/http/ApiResponse";
import { asyncWrapper } from "../../utils/asyncWrapper";
import logger from "../../utils/logger";
import { LoginDto, SignupDto } from "./auth.dto"; 

const signup = asyncWrapper(
  async (req: Request<{}, {}, SignupDto>, res: Response) => {
    const { name, email, phoneNum, password } = req.body;
    const user = await authService.signup(name, email, phoneNum, password);
    logger.info(`[${new Date().toISOString()}] 회원가입 성공: ${user.email}`);
    return ApiResponse.success(res, user, "회원가입 성공", HTTP_STATUS.CREATED);
  }
);

const login = asyncWrapper(
  async (req: Request<{}, {}, LoginDto>, res: Response) => {
    const { email, password } = req.body;
    const user = await authService.login(email, password);
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

export default {
  signup,
  login,
  logout,
};
