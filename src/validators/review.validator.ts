import { z } from "zod";
import { HTTP_MESSAGE } from "../constants/http";

// 리뷰 작성 시 요청 본문 검증
export const createReviewSchema = z.object({
  body: z.object({
    driverId: z.coerce
      .number()
      .int(HTTP_MESSAGE.BAD_REQUEST)
      .positive(HTTP_MESSAGE.BAD_REQUEST),
    rating: z.coerce
      .number()
      .int(HTTP_MESSAGE.REVIEW_RATING_RANGE)
      .min(1, HTTP_MESSAGE.REVIEW_RATING_RANGE)
      .max(5, HTTP_MESSAGE.REVIEW_RATING_RANGE),
    review_title: z.string().optional(),
    review_content: z
      .string()
      .trim()
      .min(10, HTTP_MESSAGE.REVIEW_CONTENT_RANGE)
      .max(1000, HTTP_MESSAGE.REVIEW_CONTENT_RANGE)
      .optional(),
  }),
});
