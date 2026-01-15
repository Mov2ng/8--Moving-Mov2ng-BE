import { z } from "zod";

import { Category } from "@prisma/client";

/**
 * 견적 생성 Request DTO
 */
export const PostEstimateSchema = z.object({
  movingType: z.enum(Object.values(Category), { message: "이사 유형은 SMALL, HOME, OFFICE 중 하나여야 합니다." }),
  movingDate: z.coerce.date({ message: "이사 날짜는 날짜 형식이어야 합니다." }), // z.coerce.date(), date 형식으로 변환 (YYYY-MM-DD), 타임존 이슈 프론트와 합의 필요
  origin: z.string({ message: "출발지는 문자열이어야 합니다." }), // 출발지
  destination: z.string({ message: "도착지는 문자열이어야 합니다." }), // 도착지
});

export const PostEstimateRequestSchema = z.object({
  body: PostEstimateSchema,
});

export type PostEstimateDTO = z.infer<typeof PostEstimateRequestSchema>["body"];