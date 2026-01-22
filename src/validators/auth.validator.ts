import { z } from "zod";

/**
 * 회원가입, 로그인, 토큰 재발급 요청 데이터 검증을 위한 Zod 스키마 정의
 */

export const signupSchema = z.object({
  body: z
    .object({
      role: z.enum(["USER", "DRIVER"], {
        message: "role은 'USER' 또는 'DRIVER'만 가능합니다",
      }),
      name: z.string().min(1, "이름을 입력해 주세요").max(20, "이름은 20자 이하로 입력해 주세요"),
      email: z.email("유효한 이메일을 입력해 주세요"),
      phoneNum: z
        .string()
        .superRefine((val, ctx) => {
          // 빈 값 체크
          if (!val || val.length === 0) {
            ctx.addIssue({
              code: "custom",
              message: "전화번호를 입력해 주세요",
            });
            return;
          }

          // 1. 숫자만 허용
          if (!/^\d+$/.test(val)) {
            ctx.addIssue({
              code: "custom",
              message: "숫자만 입력해 주세요",
            });
            return;
          }

          // 2. 010으로 시작하는지 체크 (각 자리수 입력 시 즉시 체크)
          const prefix = "010";
          for (let i = 0; i < Math.min(val.length, prefix.length); i++) {
            if (val[i] !== prefix[i]) {
              ctx.addIssue({
                code: "custom",
                message: "010으로 시작하는 숫자만 입력해 주세요",
              });
              return;
            }
          }

          // 3. 길이 체크
          if (val.length >= 12) {
            ctx.addIssue({
              code: "custom",
              message: "11자 이하의 숫자만 입력해 주세요",
            });
            return;
          }

          // 010 조건을 만족한 후에만 10자 미만 에러 표시
          if (val.length >= 3 && val.startsWith("010") && val.length < 10) {
            ctx.addIssue({
              code: "custom",
              message: "10자 이상의 숫자만 입력해 주세요",
            });
          }
        }),
      password: z
        .string()
        .min(8, "비밀번호는 최소 8자 이상이어야 합니다")
        .max(32, "비밀번호는 최대 32자 이하로 입력해 주세요")
        .regex(/[A-Za-z]/, { message: "비밀번호에 영문이 포함되어야 합니다." }) // 영문 1자 이상
        .regex(/[0-9]/, { message: "비밀번호에 숫자가 포함되어야 합니다." }) // 숫자 1자 이상
        .regex(/[!@#$%^&*()_\-+=]/, {
          message: "비밀번호에 특수문자가 포함되어야 합니다.",
        }), // 특수문자 1자 이상
      passwordConfirm: z.string().min(1, "비밀번호를 다시 한 번 입력해 주세요"),
    })
    .refine((data) => data.password === data.passwordConfirm, {
      path: ["passwordConfirm"],
      message: "비밀번호가 일치하지 않습니다",
    }),
});

export const loginSchema = z.object({
  body: z.object({
    role: z.enum(["USER", "DRIVER"], {
      message: "role은 'USER' 또는 'DRIVER'만 가능합니다",
    }),
    email: z.email("유효한 이메일을 입력해 주세요"),
    password: z.string().min(1, "비밀번호를 입력해 주세요"),
  }),
});

export const refreshSchema = z.object({
  cookies: z.object({
    refreshToken: z.string().min(1, "리프레시 토큰이 필요합니다"), // 빈 문자열 방지
  }),
});
