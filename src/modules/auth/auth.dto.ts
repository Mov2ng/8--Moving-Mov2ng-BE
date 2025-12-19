/**
 * 런타입 검증용 데이터 구조 정의 파일
 */

import z from "zod";
import { loginSchema, signupSchema } from "../../validators/auth.validator";

// 회원가입 요청 DTO
export type SignupDto = z.infer<typeof signupSchema>["body"];
// z.infer<타입>: 런타임 검증 규칙을 컴파일 타입으로 변환

// 로그인 요청 DTO
export type LoginDto = z.infer<typeof loginSchema>["body"];
