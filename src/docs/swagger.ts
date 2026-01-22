import swaggerJSDoc from "swagger-jsdoc";
import path from "path";
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
      ? [
          // 프로덕션: dist/src/modules/**/*.swagger.js
          path.join(process.cwd(), "dist/src/modules/**/*.swagger.js"),
          // 혹시 다른 경로에 빌드된 경우를 대비한 fallback
          path.join(process.cwd(), "dist/modules/**/*.swagger.js"),
        ]
      : [
          // 개발: src/modules/**/*.swagger.ts
          path.join(process.cwd(), "src/modules/**/*.swagger.ts"),
        ],
});

/**
 * 동적으로 Swagger spec을 생성하는 함수 (요청마다 서버 URL 업데이트)
 * @param req Express Request 객체
 * @returns 업데이트된 Swagger spec
 */
export function getSwaggerSpec(req: any) {
  const protocol = req.protocol || "http";
  const host = req.get("host") || `localhost:${env.PORT}`;
  const baseUrl = `${protocol}://${host}`;

  return {
    ...swaggerSpec,
    servers: [
      {
        url: baseUrl,
      },
    ],
  };
}
