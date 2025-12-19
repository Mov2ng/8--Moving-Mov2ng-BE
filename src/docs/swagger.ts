import swaggerJSDoc from "swagger-jsdoc";
import env from "../config/env";

/**
 * Swagger 설정 옵션
 * definition: OpenAPI 기본 정보
 * apis: Swagger 주석을 읽어올 파일 경로
 */
export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Mov2ng API",
      version: "1.0.0",
      description: "Mov2ng API 문서입니다",
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}`,
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "JWT 토큰을 입력하세요. 형식: Bearer {token}",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis:
    env.NODE_ENV === "production"
      ? ["dist/modules/**/*.swagger.js"]
      : ["src/modules/**/*.swagger.ts"],
});
