import { z } from "zod";
import { Prisma } from "@prisma/client";
import {
  driverProfileCreateSchema,
  userProfileCreateSchema,
  driverProfileUpdateSchema,
  driverBasicInfoUpdateSchema,
  userIntegrationUpdateSchema,
} from "../../validators/profile.validator";

/**
 * 프로필 생성 및 수정 API 호출시에 보내지는 req body의 데이터 구조 타입 정의
 */
export type ProfileRequestDto =
  | z.infer<typeof driverProfileCreateSchema>["body"]
  | z.infer<typeof userProfileCreateSchema>["body"]
  | z.infer<typeof driverProfileUpdateSchema>["body"];

/**
 * DRIVER 프로필 DTO (생성/수정)
 */
export type DriverProfileRequestDto =
  | z.infer<typeof driverProfileCreateSchema>["body"]
  | z.infer<typeof driverProfileUpdateSchema>["body"];

/**
 * USER 프로필 DTO (생성)
 */
export type UserProfileRequestDto = z.infer<
  typeof userProfileCreateSchema
>["body"];

/**
 * 기본정보 수정 API 호출시에 보내지는 req body의 데이터 구조 타입 정의
 */
export type BasicInfoRequestDto = z.infer<
  typeof driverBasicInfoUpdateSchema
>["body"];

/**
 * 사용자 프로필 + 기본정보 업데이트 API 호출시에 보내지는 req body의 데이터 구조 타입 정의
 */
export type UserIntegrationRequestDto = z.infer<
  typeof userIntegrationUpdateSchema
>["body"];

// 프로필 정보 응답 DTO (관계 데이터 포함)
export type ProfileResponseDto = Prisma.UserGetPayload<{
  include: {
    driver: { where: { isDelete: false } };
    service: { where: { isDelete: false } };
    region: { where: { isDelete: false } };
  };
}>;
