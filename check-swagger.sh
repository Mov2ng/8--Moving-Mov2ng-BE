#!/bin/bash

# Swagger 설정 진단 스크립트
# AWS 서버에서 실행하여 Swagger 파일 경로 문제를 진단합니다.

echo "=========================================="
echo "Swagger 설정 진단 스크립트"
echo "=========================================="
echo ""

# 1. 현재 작업 디렉토리 확인
echo "1️⃣ 현재 작업 디렉토리 (pwd):"
pwd
echo ""

# 2. NODE_ENV 확인
echo "2️⃣ NODE_ENV 환경 변수:"
echo "NODE_ENV=${NODE_ENV:-'(설정되지 않음)'}"
echo ""

# 3. dist 디렉토리 존재 여부 확인
echo "3️⃣ dist 디렉토리 존재 여부:"
if [ -d "dist" ]; then
  echo "✅ dist 디렉토리 존재"
  echo "   구조:"
  ls -la dist/ | head -10
else
  echo "❌ dist 디렉토리가 없습니다!"
fi
echo ""

# 4. dist/src/modules 디렉토리 확인
echo "4️⃣ dist/src/modules 디렉토리 확인:"
if [ -d "dist/src/modules" ]; then
  echo "✅ dist/src/modules 디렉토리 존재"
  echo "   모듈 목록:"
  ls -1 dist/src/modules/ 2>/dev/null || echo "   (비어있음)"
else
  echo "❌ dist/src/modules 디렉토리가 없습니다!"
fi
echo ""

# 5. Swagger 파일 검색 (dist/src/modules)
echo "5️⃣ dist/src/modules/**/*.swagger.js 파일 검색:"
SWAGGER_FILES=$(find dist/src/modules -name "*.swagger.js" 2>/dev/null)
if [ -n "$SWAGGER_FILES" ]; then
  echo "✅ Swagger 파일 발견:"
  echo "$SWAGGER_FILES" | while read -r file; do
    echo "   - $file"
  done
  SWAGGER_COUNT=$(echo "$SWAGGER_FILES" | wc -l | tr -d ' ')
  echo "   총 $SWAGGER_COUNT 개 파일"
else
  echo "❌ Swagger 파일을 찾을 수 없습니다!"
fi
echo ""

# 6. Swagger 파일 검색 (dist/modules - fallback 경로)
echo "6️⃣ dist/modules/**/*.swagger.js 파일 검색 (fallback):"
SWAGGER_FILES_FALLBACK=$(find dist/modules -name "*.swagger.js" 2>/dev/null)
if [ -n "$SWAGGER_FILES_FALLBACK" ]; then
  echo "✅ Swagger 파일 발견 (fallback 경로):"
  echo "$SWAGGER_FILES_FALLBACK" | while read -r file; do
    echo "   - $file"
  done
  SWAGGER_COUNT_FALLBACK=$(echo "$SWAGGER_FILES_FALLBACK" | wc -l | tr -d ' ')
  echo "   총 $SWAGGER_COUNT_FALLBACK 개 파일"
else
  echo "⚠️  Fallback 경로에도 Swagger 파일이 없습니다."
fi
echo ""

# 7. src 디렉토리 확인 (개발 환경용)
echo "7️⃣ src/modules/**/*.swagger.ts 파일 검색 (개발 환경):"
if [ -d "src/modules" ]; then
  SRC_SWAGGER_FILES=$(find src/modules -name "*.swagger.ts" 2>/dev/null)
  if [ -n "$SRC_SWAGGER_FILES" ]; then
    echo "✅ 소스 Swagger 파일 발견:"
    echo "$SRC_SWAGGER_FILES" | while read -r file; do
      echo "   - $file"
    done
    SRC_SWAGGER_COUNT=$(echo "$SRC_SWAGGER_FILES" | wc -l | tr -d ' ')
    echo "   총 $SRC_SWAGGER_COUNT 개 파일"
  else
    echo "⚠️  소스 Swagger 파일을 찾을 수 없습니다."
  fi
else
  echo "⚠️  src 디렉토리가 없습니다 (프로덕션 환경일 수 있음)"
fi
echo ""

# 8. 빌드 산출물 확인
echo "8️⃣ 빌드 산출물 확인:"
if [ -f "dist/src/app.js" ]; then
  echo "✅ dist/src/app.js 존재"
else
  echo "❌ dist/src/app.js가 없습니다!"
  echo "   빌드가 제대로 되지 않았을 수 있습니다."
fi
echo ""

# 9. package.json 확인
echo "9️⃣ package.json 빌드 스크립트 확인:"
if [ -f "package.json" ]; then
  echo "빌드 스크립트:"
  grep -A 2 '"build"' package.json || echo "   build 스크립트를 찾을 수 없습니다."
  echo "시작 스크립트:"
  grep -A 2 '"start"' package.json || echo "   start 스크립트를 찾을 수 없습니다."
else
  echo "❌ package.json이 없습니다!"
fi
echo ""

# 10. 요약 및 권장 사항
echo "=========================================="
echo "📋 진단 요약"
echo "=========================================="
echo ""

if [ -n "$SWAGGER_FILES" ]; then
  echo "✅ dist/src/modules 경로에 Swagger 파일이 있습니다."
  echo "   → swagger.ts의 경로 설정이 올바릅니다."
elif [ -n "$SWAGGER_FILES_FALLBACK" ]; then
  echo "⚠️  dist/modules 경로에만 Swagger 파일이 있습니다."
  echo "   → swagger.ts의 경로를 확인하세요."
else
  echo "❌ Swagger 파일을 찾을 수 없습니다!"
  echo ""
  echo "🔧 권장 조치:"
  echo "   1. npm run build 실행"
  echo "   2. tsconfig.json에서 swagger.ts 파일이 include에 포함되어 있는지 확인"
  echo "   3. 각 swagger.ts 파일에 'export {};'가 있는지 확인"
fi

echo ""
echo "=========================================="
