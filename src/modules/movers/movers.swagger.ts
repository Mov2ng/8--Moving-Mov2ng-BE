import { Category, RegionType } from "../../generated/prisma";
import { MoverSortSchema } from "./mover.dto";

export const moversSwagger = {
  getMovers: {
    summary: "기사님 목록 조회",
    description: "기사님 목록 조회 API",
    tags: ["Movers"],
    request: {
      query: {
        type: "object",
        properties: {
          keyword: { type: "string" },
          region: { type: "enum", enum: RegionType },
          service: { type: "enum", enum: Category },
          sort: { type: "enum", enum: MoverSortSchema },
          cursor: { type: "number" },
          limit: { type: "number", default: 20 },
        },
      },
    },
    responses: {
      200: {
        description: "기사님 목록 조회 성공",
        content: {
          "application/json": {
            schema: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "number" },
                  nickname: { type: "string" },
                  driverYears: { type: "number" },
                  driverIntro: { type: "string" },
                  createdAt: { type: "string", format: "date-time" },
                  serviceCategories: {
                    type: "array",
                    items: { type: "enum", enum: Category },
                  },
                  regions: {
                    type: "array",
                    items: { type: "enum", enum: RegionType },
                  },
                  rating: { type: "number" },
                  reviewCount: { type: "number" },
                  favoriteCount: { type: "number" },
                  confirmCount: { type: "number" },
                  isFavorite: { type: "boolean" },
                },
              },
            },
          },
        },
      },
    },
  },
};
