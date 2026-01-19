import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";
import env from "../config/env";

/**
 * Sentry 초기화 (비용 최적화 설정)
 * - 무료 플랜: 에러 5,000개/월, 스팬 1천만 개/월
 * - 비용 절감 전략: 샘플링 최소화, 프로파일링 선택적, 중복 에러 필터링
 */

// DSN이 없으면 Sentry 비활성화 (로컬 개발 시 비용 절감)
if (!env.SENTRY_DSN) {
  console.log("⚠️ SENTRY_DSN이 없어 Sentry를 비활성화합니다.");
} else {
  // 환경별 샘플링 비율 설정 (비용 최적화)
  const getSampleRate = () => {
    if (env.NODE_ENV === "production") {
      return 0.01; // 프로덕션: 1%만 추적 
    }
    if (env.NODE_ENV === "development") {
      return 0.1; // 개발: 10% 추적
    }
    return 1.0; // 로컬: 100% 추적 (로컬은 DSN 없으면 비활성화됨)
  };

  // 프로파일링은 프로덕션에서 비활성화
  const integrations = [Sentry.expressIntegration()];
  if (env.NODE_ENV !== "production") {
    integrations.push(nodeProfilingIntegration());
  }

  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.NODE_ENV,
    integrations,
    enableLogs: true, // 로그 전송 (에러 발생 시에만 유용)
    tracesSampleRate: getSampleRate(), // 트레이스 샘플링 
    profileSessionSampleRate:
      env.NODE_ENV === "production" ? 0 : getSampleRate(), // 프로덕션에서 프로파일링 비활성화
    profileLifecycle: env.NODE_ENV === "production" ? undefined : "trace",
    sendDefaultPii: false, // PII 데이터 전송 비활성화 (비용 절감)

    // 중복/불필요한 에러 필터링 (비용 절감)
    beforeSend(event, hint) {
      // 4xx 에러는 클라이언트 에러이므로 제외 (서버 에러만 추적)
      if (event.exception) {
        const error = hint.originalException;
        if (error && typeof error === "object" && "statusCode" in error) {
          const statusCode = (error as { statusCode?: number }).statusCode;
          if (statusCode && statusCode >= 400 && statusCode < 500) {
            return null; // 4xx 에러는 전송하지 않음
          }
        }
      }
      return event;
    },

    // 무료 플랜 한도 초과 방지
    maxBreadcrumbs: 30, // 기본값 100 → 30으로 감소
  });
}
