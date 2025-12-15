/**
 * Auth API Swagger 문서
 * - 회원가입
 * - 로그인
 * - 로그아웃
 * - 토큰 재발급
 */
export const authSwagger = {
  signup: {
    summary: "회원가입",
    description: "회원가입 API",
    tags: ["Auth"],
    request: {
      body: {
        type: "object",
        properties: {
          email: { type: "string" },
          password: { type: "string" },
          passwordConfirm: { type: "string" },
        },
      },
    },
    responses: {
      200: {
        description: "회원가입 성공",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: { message: { type: "string" } },
            },
          },
        },
      },
    },
    400: {
      description: "회원가입 실패",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: { message: { type: "string" } },
          },
        },
      },
    },
    500: {
      description: "회원가입 서버 오류",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: { message: { type: "string" } },
          },
        },
      },
    },
  },
  login: {
    summary: "로그인",
    description: "로그인 API",
    tags: ["Auth"],
    request: {
      body: {
        type: "object",
        properties: {
          email: { type: "string" },
        },
      },
    },
    responses: {
      200: {
        description: "로그인 성공",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: { message: { type: "string" } },
            },
          },
        },
      },
    },
    400: {
      description: "로그인 실패",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: { message: { type: "string" } },
          },
        },
      },
    },
    500: {
      description: "로그인 서버 오류",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: { message: { type: "string" } },
          },
        },
      },
    },
  },
  logout: {
    summary: "로그아웃",
    description: "로그아웃 API",
    tags: ["Auth"],
    request: {
      body: {
        type: "object",
        properties: {
          email: { type: "string" },
        },
      },
    },
    responses: {
      200: {
        description: "로그아웃 성공",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: { message: { type: "string" } },
            },
          },
        },
      },
    },
  },
  400: {
    description: "로그아웃 실패",
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: { message: { type: "string" } },
        },
      },
    },
  },
  500: {
    description: "로그아웃 서버 오류",
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: { message: { type: "string" } },
        },
      },
    },
  },
};
