import { z } from "zod";
import { Request } from "express";
import { Role, Category, RegionType } from "@prisma/client";

/**
 * 프로필 생성 및 수정 검증 스키마
 * - USER와 DRIVER 프로필 생성 공통 필드: profileImage, serviceCategories, region
 * - DRIVER 전용 필드: nickname, driverYears, driverIntro, driverContent
 *
 * 기본정보 수정 검증 스키마
 * - DRIVER 전용 필드: name, phoneNum, currentPassword, newPassword, newPasswordConfirm
 *
 * USER 통합 수정 검증 스키마
 * - USER 기본정보 필드: name, phoneNum, currentPassword, newPassword, newPasswordConfirm
 * - USER 프로필 필드: profileImage, serviceCategories, region
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

/**
 * 프로필 수정 필드 스키마 (순수 필드 정의, 모든 필드 optional)
 */
const profileFieldsSchema = z.object({
  profileImage: z.string().optional(),
  serviceCategories: z.array(categoryEnum).optional(),
  region: z.array(regionTypeEnum).optional(),
});

/**
 * 프로필 생성 필드 스키마 (모든 필드 필수)
 */
const profileCreateFieldsSchema = z.object({
  profileImage: z.string().min(1, "프로필 이미지를 입력해 주세요"),
  serviceCategories: z
    .array(categoryEnum)
    .min(1, "서비스 카테고리는 최소 1개 이상이어야 합니다"),
  region: z.array(regionTypeEnum).min(1, "지역은 최소 1개 이상이어야 합니다"),
});

/**
 * 기사 프로필 생성 스키마
 */
export const driverProfileCreateSchema = z.object({
  body: profileCreateFieldsSchema.extend({
    nickname: z.string().min(1, "닉네임을 입력해 주세요").max(50),
    driverYears: z.number().min(0, "운전 경력은 0 이상이어야 합니다"),
    driverIntro: z
      .string()
      .min(1, "기사 소개를 입력해 주세요")
      .max(1000, "기사 소개는 최대 1000자 이하이어야 합니다"),
    driverContent: z
      .string()
      .min(1, "기사 상세 내용을 입력해 주세요")
      .max(1000, "기사 상세 내용은 최대 1000자 이하이어야 합니다"),
  }),
});

/**
 * 사용자 프로필 생성 스키마
 */
export const userProfileCreateSchema = z.object({
  body: profileCreateFieldsSchema,
});

/**
 * 기사 프로필 수정 스키마
 */
export const driverProfileUpdateSchema = z.object({
  body: profileFieldsSchema.extend({
    nickname: z.string().min(1, "닉네임을 입력해 주세요").max(50).optional(),
    driverYears: z
      .number()
      .min(0, "운전 경력은 0 이상이어야 합니다")
      .optional(),
    driverIntro: z
      .string()
      .min(1, "기사 소개를 입력해 주세요")
      .max(1000, "기사 소개는 최대 1000자 이하이어야 합니다")
      .optional(),
    driverContent: z
      .string()
      .min(1, "기사 상세 내용을 입력해 주세요")
      .max(1000, "기사 상세 내용은 최대 1000자 이하이어야 합니다")
      .optional(),
  }),
});

/**
 * 프로필 스키마 생성 함수 (HTTP 메서드에 따라 생성/수정 분기)
 * - POST: 생성용 스키마 (USER/DRIVER 모두)
 * - PUT: 수정용 스키마 (DRIVER만, USER는 userIntegrationUpdateSchema 사용)
 */
export const profileSchema = (req: Request): z.ZodTypeAny => {
  const isDriver = req.user?.role === Role.DRIVER;
  const isCreate = req.method === "POST";

  // 프로필 생성 요청인 경우
  if (isCreate) {
    // DRIVER는 기사용 프로필 생성 스키마, USER는 사용자용 프로필 생성 스키마 사용
    return isDriver ? driverProfileCreateSchema : userProfileCreateSchema;
  } else {
    // PUT 요청은 DRIVER만 (USER는 통합형 수정 스키마 사용)
    return driverProfileUpdateSchema;
  }
};

/**
 * 기본정보 수정 필드 스키마 (순수 필드 정의만, 모든 필드 optional)
 * - name: 이름 (변경 가능)
 * - phoneNum: 전화번호 (변경 가능)
 * - currentPassword: 현재 비밀번호 (비밀번호 변경 시 필수)
 * - newPassword: 새 비밀번호 (비밀번호 변경 시 필수)
 * - newPasswordConfirm: 새 비밀번호 확인 (비밀번호 변경 시 필수)
 */
const basicInfoFieldsSchema = z.object({
  name: z.string().min(1, "이름을 입력해 주세요").max(50).optional(),
  phoneNum: z
    .string()
    .regex(/^[0-9]+$/, "숫자만 입력해 주세요")
    .min(10, "전화번호는 최소 10자 이상이어야 합니다")
    .max(11, "전화번호는 최대 11자 이하이어야 합니다")
    .transform((val) => (typeof val === "string" ? val : String(val)))
    .optional(),
  currentPassword: z.string().optional(),
  newPassword: z
    .string()
    .min(8, "비밀번호는 최소 8자 이상이어야 합니다")
    .max(128)
    .regex(/[A-Za-z]/, { message: "비밀번호에 영문이 포함되어야 합니다." })
    .regex(/[0-9]/, { message: "비밀번호에 숫자가 포함되어야 합니다." })
    .regex(/[!@#$%^&*()_\-+=]/, {
      message: "비밀번호에 특수문자가 포함되어야 합니다.",
    })
    .optional(),
  newPasswordConfirm: z.string().optional(),
});

/**
 * 비밀번호 검증 refine 함수 (재사용)
 */
const passwordValidationRefines = <T extends z.ZodTypeAny>(schema: T) =>
  schema
    .refine(
      (data: any) => {
        // 비밀번호 변경을 시도하는 경우에만 검증
        if (data.newPassword || data.newPasswordConfirm) {
          return (
            data.currentPassword && data.newPassword && data.newPasswordConfirm
          );
        }
        return true;
      },
      {
        message: "비밀번호 변경 시 모든 비밀번호 필드를 입력해주세요",
        path: ["currentPassword"],
      }
    )
    .refine(
      (data: any) => {
        // 새 비밀번호와 확인이 일치하는지 검증
        if (data.newPassword && data.newPasswordConfirm) {
          return data.newPassword === data.newPasswordConfirm;
        }
        return true;
      },
      {
        path: ["newPasswordConfirm"],
        message: "비밀번호가 일치하지 않습니다",
      }
    )
    .refine(
      (data: any) => {
        // email 필드는 disabled 필드이므로 API 요청에 포함되면 안 됨
        return !("email" in data && data.email !== undefined);
      },
      {
        message: "이메일 필드는 수정할 수 없습니다",
        path: ["email"],
      }
    );

/**
 * 기사 기본정보 수정 스키마
 * - /driver/basic 엔드포인트에서 직접 사용
 */
export const driverBasicInfoUpdateSchema = z.object({
  body: passwordValidationRefines(basicInfoFieldsSchema),
});

/**
 * 사용자 통합형 수정 스키마
 * - 프로필 필드 + 기본정보 필드 통합
 */
export const userIntegrationUpdateSchema = z.object({
  body: passwordValidationRefines(
    profileFieldsSchema.extend(basicInfoFieldsSchema.shape)
  ),
});
