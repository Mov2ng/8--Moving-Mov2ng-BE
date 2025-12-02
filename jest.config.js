import { createDefaultPreset } from "ts-jest";

// 기본 프리셋에서 'transform' 부분만 추출해서 ts 파일을 JS로 변환하는 설정
const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  // Jest 테스트 환경을 Node.js로 설정 (브라우저 환경X)
  testEnvironment: "node",
  transform: {
    // ts-jest 기본 transform 설정 그대로 사용
    ...tsJestTransformCfg,
  },
};
