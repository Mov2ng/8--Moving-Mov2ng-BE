import "express";
import { User } from "@prisma/client";

/**
 * express.Request 인터페이스 전역 타입 확장
 * user 프로퍼티 추가
 * - optionalAuthMiddleware: user는 undefined일 수 있음 (비회원 허용)
 * - authMiddleware: user는 항상 존재함 (로그인 필수, 런타임 보장)
 */
declare module "express" {
  export interface Request {
    user?: Pick<
      User,
      | "id"
      | "role"
      | "email"
      | "name"
      | "phone_number"
      | "profileImage"
      | "createdAt"
      | "updatedAt"
    >;
  }
}
