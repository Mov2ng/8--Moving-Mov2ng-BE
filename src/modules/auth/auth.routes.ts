import express from "express";
import authController from "./auth.controller";
import validate from "../../middlewares/validate.middleware";
import {
  loginSchema,
  signupSchema,
  refreshSchema,
} from "../../validators/auth.validator";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { guestOnlyMiddleware } from "../../middlewares/role.middleware";
import { loginRateLimiter } from "../../middlewares/rateLimit.middleware";

const authRouter = express.Router();

authRouter.post(
  "/signup",
  validate(signupSchema),
  guestOnlyMiddleware,
  authController.signup
);

authRouter.post(
  "/login",
  loginRateLimiter, // 요청 횟수 제한 미들웨어
  validate(loginSchema),
  guestOnlyMiddleware,
  authController.login
);

authRouter.post("/logout", authMiddleware, authController.logout);

authRouter.post("/refresh", validate(refreshSchema), authController.refresh);

authRouter.get("/me", authMiddleware, authController.me);

export default authRouter;
