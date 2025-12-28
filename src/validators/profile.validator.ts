import { z } from "zod";
import { Request } from "express";
import { Role, Category, RegionType } from "@prisma/client";

/**
 * 프로필 요청 검증 스키마
 * - role이 DRIVER일 때만 nickname, driverYears, driverIntro, driverContent 검증
 * - USER인 경우 해당 필드들이 있으면 에러 반환
 */

// Category enum 값 검증
const categoryEnum = z.enum(
  // Prisma enum은 항상 값이 있으므로 타입 단언 가능
  Object.values(Category) as [Category, ...Category[]],
  {
    message:
      "유효하지 않은 서비스 카테고리입니다. (SMALL, HOME, OFFICE 중 하나)",
  }
);

// RegionType enum 값 검증
const regionTypeEnum = z.enum(
  // Prisma enum은 항상 값이 있으므로 타입 단언 가능
  Object.values(RegionType) as [RegionType, ...RegionType[]],
  {
    message: "유효하지 않은 지역입니다.",
  }
);

// 기본 프로필 스키마 (공통 필드)
const baseProfileSchema = z.object({
  // TODO: S3 세팅 후에는 URL 형식만 허용하도록 수정
  profileImage: z.string().optional(),
  serviceCategories: z.array(categoryEnum).optional(),
  region: z.array(regionTypeEnum).optional(),
  // DRIVER 전용 필드들 (USER일 때는 optional로 허용하되 validation에서는 무시)
  nickname: z.string().optional(),
  driverYears: z.number().optional(),
  driverIntro: z.string().optional(),
  driverContent: z.string().optional(),
});

// DRIVER용 프로필 스키마 (DTO에서 타입 추출을 위해 export)
export const driverProfileSchema = z.object({
  body: baseProfileSchema.extend({
    nickname: z.string().min(1, "닉네임을 입력해 주세요").max(50),
  }),
});

// USER용 프로필 스키마 (DTO에서 타입 추출을 위해 export)
export const userProfileSchema = z.object({
  body: baseProfileSchema
    .refine((data) => !data.nickname, {
      message: "일반 회원은 닉네임을 사용할 수 없습니다",
      path: ["nickname"],
    })
    .refine((data) => data.driverYears === undefined, {
      message: "일반 회원은 운전 경력을 입력할 수 없습니다",
      path: ["driverYears"],
    })
    .refine((data) => !data.driverIntro, {
      message: "일반 회원은 기사 소개를 입력할 수 없습니다",
      path: ["driverIntro"],
    })
    .refine((data) => !data.driverContent, {
      message: "일반 회원은 기사 상세 내용을 입력할 수 없습니다",
      path: ["driverContent"],
    }),
});

// 프로필 스키마 생성 함수
export const profileSchema = (req: Request) => {
  const isDriver = req.user?.role === Role.DRIVER;
  return isDriver ? driverProfileSchema : userProfileSchema;
};
