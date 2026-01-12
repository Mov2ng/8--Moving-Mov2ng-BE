import express from "express"; // 외부 라이브러리
import { authMiddleware } from "../../middlewares/auth.middleware"; // 인증/인가 처리 미들웨어
import validate from "../../middlewares/validate.middleware"; // 요청 데이터(schema) 검증 미들웨어
import { profileSchema } from "../../validators/profile.validator"; // 프로필 관련 요청 검증 스키마
import profileController from "./profile.controller"; // 프로필 도메인 컨트롤러

const userRouter = express.Router();

const profileRouter = express.Router();

userRouter.use("/profile", profileRouter);

profileRouter
  .get("/", authMiddleware, profileController.getProfile)
  .post(
    "/",
    authMiddleware,
    validate(profileSchema),
    profileController.createProfile
  )
  .put(
    "/",
    authMiddleware,
    validate(profileSchema),
    profileController.updateProfile
  );

export default userRouter;
