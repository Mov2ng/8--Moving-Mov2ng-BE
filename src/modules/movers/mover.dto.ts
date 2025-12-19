import { z } from "zod";
import { RegionType, Category } from "../../generated/prisma";

/**
 * 정렬 기준
 */
export const MoverSortSchema = z.enum([
  'review',   // 리뷰 많은순
  'rating',   // 평점 높은순
  'career',   // 경력 높은순
  'confirm',  // 확정 많은순
]);

export type MoverSortType = z.infer<typeof MoverSortSchema>;

/**
 * 지역 필터
 */
export const RegionFilterSchema = z.enum(Object.values(RegionType));

/**
 * 서비스 카테고리
 */
export const ServiceCategorySchema = z.enum(Object.values(Category));

/**
 * 기사님 리스트 조회 Request DTO
 */
export const MoverListQuerySchema = z.object({
  /** 기사님 닉네임 검색 */
  keyword: z.string().min(1).optional(),
  /** 지역 필터 */
  region: RegionFilterSchema.optional(),
  /** 서비스 카테고리 필터 */
  service: ServiceCategorySchema.optional(),
  /** 정렬 기준 */
  sort: MoverSortSchema.optional(),
  /** 무한 스크롤 cursor */
  cursor: z.coerce.number().int().optional(),
  /** 페이지 크기 */
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type MoverListQueryDTO = z.infer<typeof MoverListQuerySchema>;


/**
 * 기사님 정보 응답(request) 데이터 검증을 위한 Zod 스키마 정의
 */
const MoverDtoSchema = z.object({
  id: z.number(),
  nickname: z.string(),
  driverYears: z.number(),
  driver_intro: z.string(),
  favoriteCount: z.number(),
  reviewCount: z.number(),
  estimateCount: z.number(),
  service_categories: z.array(z.string()),
});

export type MoverDTO = z.infer<typeof MoverDtoSchema>;