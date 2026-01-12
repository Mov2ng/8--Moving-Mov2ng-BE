import { z } from "zod";
import { Prisma } from "@prisma/client";
import {
  driverProfileSchema,
  userProfileSchema,
} from "../../validators/profile.validator";

/**
 * 프로필 관련 API 호출시에 보내지는 req body의 데이터 구조 타입 정의 (schema)
 * validator의 스키마에서 타입 추출 (auth.dto.ts 패턴과 동일)
 * z.infer<타입>: 런타임 검증 규칙을 컴파일 타입으로 변환
 */
export type ProfileRequestDto =
  | z.infer<typeof driverProfileSchema>["body"]
  | z.infer<typeof userProfileSchema>["body"];

// 프로필 정보 응답 DTO (관계 데이터 포함)
export type ProfileResponseDto = Prisma.UserGetPayload<{
  include: {
    driver: { where: { isDelete: false } };
    service: { where: { isDelete: false } };
    region: { where: { isDelete: false } };
  };
}>;
