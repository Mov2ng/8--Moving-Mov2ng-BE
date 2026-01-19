import express from "express"; // 외부 라이브러리
import { authMiddleware } from "../../middlewares/auth.middleware"; // 인증/인가 처리 미들웨어
import validate from "../../middlewares/validate.middleware"; // 요청 데이터(schema) 검증 미들웨어
import {
  profileSchema,
  driverBasicInfoUpdateSchema,
  userIntegrationUpdateSchema,
  driverProfileUpdateSchema,
} from "../../validators/profile.validator"; // 프로필 관련 요청 검증 스키마
import profileController from "./profile.controller"; // 프로필 도메인 컨트롤러
import {
  driverOnlyMiddleware,
  userOnlyMiddleware,
} from "../../middlewares/role.middleware";

const profileRouter = express.Router();

profileRouter
  .get("/", authMiddleware, profileController.getProfile)
  .post(
    "/",
    authMiddleware,
    validate(profileSchema),
    profileController.createProfile
  )
  // 프로필 업데이트 (기사님)
  .put(
    "/driver",
    authMiddleware,
    driverOnlyMiddleware,
    validate(driverProfileUpdateSchema),
    profileController.updateProfile
  )
  // 기본정보 업데이트 (기사님)
  .put(
    "/driver/basic",
    authMiddleware,
    driverOnlyMiddleware,
    validate(driverBasicInfoUpdateSchema),
    profileController.updateBasicInfo
  )
  // 프로필 + 기본정보 업데이트
  .put(
    "/user",
    authMiddleware,
    userOnlyMiddleware,
    validate(userIntegrationUpdateSchema),
    profileController.updateUserIntegration
  );

export default profileRouter;
