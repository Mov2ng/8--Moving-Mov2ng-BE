import "express";
import { Role } from "@prisma/client";

/**
 * express.Request 인터페이스 전역 타입 확장
 * user 프로퍼티 추가
 * user 프로퍼티는 인증된 사용자의 ID를 저장
 */
declare module "express" {
  export interface Request {
    user?: { id: string; role: Role };
  }
}
