import { z } from "zod";

import { Category } from "@prisma/client";

/**
 * 견적 생성 Request DTO
 */
export const PostEstimateSchema = z.object({
  movingType: z.enum(Object.values(Category)),
  movingDate: z.coerce.date(), // z.coerce.date(), date 형식으로 변환 (YYYY-MM-DD), 타임존 이슈 프론트와 합의 필요
  origin: z.string(), // 출발지
  destination: z.string(), // 도착지
});

export type PostEstimateDTO = z.infer<typeof PostEstimateSchema>;