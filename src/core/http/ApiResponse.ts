import { Response } from "express";
import { HTTP_CODE, HTTP_MESSAGE, HTTP_STATUS } from "../../constants/http";

export interface ApiResponseMeta {
  [key: string]: unknown; // 페이징 등 추가 정보
}

export interface ApiResponseEnvelope<T> {
  success: true;
  message: string;
  data: T;
  meta?: ApiResponseMeta;
}
/**
 * 응답 객체 표준화
 */
class ApiResponse {
  /**
   * 성공 응답 반환
   * @param res - Express Response 객체
   * @param data - 응답 데이터
   * @param message - 사용자에게 보여줄 메시지 (기본: HTTP_MESSAGE.SUCCESS)
   * @param statusCode - HTTP 상태 코드 (기본: 200 OK)
   * @returns Express Response 객체
   */
  public static success<T>(
    res: Response,
    data: T,
    message: string = HTTP_MESSAGE.OK,
    statusCode: number = HTTP_STATUS.OK,
    meta?: ApiResponseMeta
  ): Response {
    const response: ApiResponseEnvelope<T> = { success: true, message, data };
    if (meta) response.meta = meta;
    return res.status(statusCode).json(response);
  }
}

export default ApiResponse;
