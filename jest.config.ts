import { createDefaultPreset } from "ts-jest";
import type { Config } from "jest";

// 기본 프리셋에서 'transform' 부분만 추출해서 ts 파일을 JS로 변환하는 설정
const tsJestTransformCfg = createDefaultPreset().transform;

const config: Config = {
  // Jest 테스트 환경을 Node.js로 설정 (브라우저 환경X)
  testEnvironment: "node",
  transform: {
    // ts-jest 기본 transform 설정 그대로 사용
    ...tsJestTransformCfg,
  },
  // 테스트 파일 패턴
  testMatch: ["**/__tests__/**/*.test.ts", "**/?(*.)+(spec|test).ts"],
  // 모듈 경로 매핑
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  // 커버리지 설정
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.d.ts",
    "!src/**/*.swagger.ts",
    "!src/**/*.routes.ts",
    "!src/app.ts",
    "!src/config/**",
    "!src/generated/**",
    "!src/types/**",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  // 커버리지 임계값 설정
  coverageThreshold: {
    global: {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0,
    },
  },
  // 테스트 전 설정 파일
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
};

export default config;

