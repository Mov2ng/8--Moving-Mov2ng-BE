/**
 * 전역 커스텀 에러 클래스
 * - HTTP 상태코드와 메세지 함께 담아 컨트롤러/서비스에 throw
 * - Error 확장해 instanceof 검사로 타입 판별
 * 서비스/컨트롤러에서 throw new ApiError(상태코드, '상태메세지')
 * 에러-핸들러에서 자동으로 HTTP 응답으로 변환
 */

export interface ApiErrorDetail {
  field: string;
  reason: string; // 상세 필드별 에러 메세지 (ex. 이메일은 필수입니다)
}

export interface ApiErrorResponse {
  success: false;
  message: string; // 전체 에러 메세지
  code: string; // 비즈니스 로직 식별용
  details?: ApiErrorDetail[];
  stack?: string;
}

class ApiError extends Error {
  // HTTP 상태 코드
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: ApiErrorDetail[];
  // this.**.** 접근에 타입 안전성 보장
  // readonly로 이후 코드에서 수정 불가

  /**
   * @param statusCode  HTTP 상태 코드
   * @param message     사용자에게 전달할 에러 메세지
   * @param stack       리모트 에러 전파 시 외부에서 전달할 스택 트레이스 (사용시 활성화)
   */
  // constructor(statusCode: number, message: string, stack = '') {
  constructor(
    statusCode: number,
    message: string,
    code: string,
    details?: ApiErrorDetail[]
  ) {
    // 상속한 Error 생성자(내부적으로 message 처리 로직 있음)에 message 전달, 초기화
    super(message);

    // 상태 코드 설정 (커스텀 속성 추가)
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;

    // Babel/TS 트랜스파일 시 프로토타입 체인 깨짐 버그 방지 (직접 프로토타입 재설정)
    Object.setPrototypeOf(this, new.target.prototype);

    /*
    // 스택이 외부에서 주어지면 덮어쓰기
    if (stack) {
     this.stack = stack;
    } else {
     // V8 전용, 현재 클래스에서의 스택 시작 지점 설정
     Error.captureStackTrace(this, this.constructor);
    }
    */
  }
}

export default ApiError;
