import { Request, Response } from "express";
import { HTTP_CODE, HTTP_STATUS } from "../../constants/http";
import ApiError from "../../core/http/ApiError";
import { hashPassword, verifyPassword } from "../../core/security/password";
import {
  generateRefreshToken,
  generateToken,
  verifyToken,
} from "../../utils/jwt";
import authRepository from "./auth.repository";
import { Role } from "@prisma/client";
import env from "../../config/env";
import { SERVER } from "../../constants/http";
import logger from "../../utils/logger";

// NODE_ENV가 'local'인 경우에만 로컬 환경으로 간주 (HTTP, SameSite: Strict)
// 그 외(production, development)는 모두 배포 환경으로 간주 (HTTPS, SameSite: None)
const isLocal = env.NODE_ENV === "local";

// 환경변수 확인 (서버 시작 시 한 번만 로깅)
if (!isLocal) {
  logger.info(
    `[환경변수 확인] NODE_ENV: ${
      env.NODE_ENV
    }, isLocal: ${isLocal}, CORS_ORIGIN: ${env.CORS_ORIGIN || "미설정"}`
  );
}

/**
 * refreshToken 쿠키 설정 유틸 함수
 * - HTTP-only 쿠키로 설정하여 XSS 공격 방지
 * - 로컬/배포 환경에 따라 secure, sameSite 옵션 분기
 * @param res Express Response 객체
 * @param refreshToken 설정할 refreshToken 문자열
 */
function setRefreshTokenCookie(
  res: Response,
  refreshToken: string,
  req?: Request
) {
  const cookieOptions = {
    httpOnly: true, // JS 접근 불가 (XSS 공격 방지)
    secure: !isLocal, // 로컬: HTTP도 쿠키 전송, 배포: HTTPS에서만 쿠키 전송
    sameSite: (isLocal ? "strict" : "none") as "strict" | "none", // 로컬: 같은 프로토콜, 도메인, 포트에서만 쿠키 전송, 배포: 배포 도메인이 달라도 전송 허용
    maxAge: SERVER.COOKIE_MAX_AGE_7_DAYS, // 7일
    path: "/",
  };

  // 배포 환경에서 쿠키 옵션 확인 (첫 로그인 시 한 번만)
  if (!isLocal && req) {
    const protocol = req.protocol;
    const isSecure = req.secure;
    logger.info(
      `[쿠키 설정] NODE_ENV: ${env.NODE_ENV}, protocol: ${protocol}, req.secure: ${isSecure}, cookieOptions: secure=${cookieOptions.secure}, sameSite=${cookieOptions.sameSite}`
    );
  }

  res.cookie("refreshToken", refreshToken, cookieOptions);
}

/**
 * refreshToken 쿠키 삭제 유틸 함수
 * - 로그아웃 또는 토큰 만료 시 쿠키 삭제
 * @param res Express Response 객체
 */
function clearRefreshTokenCookie(res: Response) {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: !isLocal,
    sameSite: isLocal ? "strict" : "none",
    path: "/",
  });
}

async function signup(
  name: string,
  email: string,
  phoneNum: string,
  password: string,
  role: string
) {
  // role을 Role enum 타입으로 변환 (타입 단언 없이)
  const roleEnum: Role = role === "USER" ? Role.USER : Role.DRIVER;

  // 유저 중복 체크
  const existingUser = await authRepository.findUserByEmailAndRole(
    email,
    roleEnum
  );
  if (existingUser) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "이미 가입한 계정입니다.",
      HTTP_CODE.BAD_REQUEST
    );
  }

  // 비밀번호 해싱
  const hashedPassword = await hashPassword(password);
  if (!hashedPassword) {
    throw new ApiError(
      HTTP_STATUS.INTERNAL_ERROR,
      "비밀번호 해싱에 실패했습니다.",
      HTTP_CODE.INTERNAL_ERROR
    );
  }

  // DB에 사용자 정보 저장
  const user = await authRepository.createUser(
    name,
    email,
    phoneNum,
    hashedPassword,
    roleEnum
  );

  if (!user) {
    throw new ApiError(
      HTTP_STATUS.INTERNAL_ERROR,
      "사용자 생성에 실패했습니다.",
      HTTP_CODE.INTERNAL_ERROR
    );
  }
  return user;
}

async function login(
  email: string,
  password: string,
  res: Response,
  req: Request,
  role: string
) {
  // role을 Role enum 타입으로 변환 (타입 단언 없이)
  const roleEnum: Role = role === "USER" ? Role.USER : Role.DRIVER;

  // 사용자 정보 조회
  const user = await authRepository.findUserByEmailAndRole(email, roleEnum);
  if (!user) {
    throw new ApiError(
      HTTP_STATUS.NOT_FOUND,
      "사용자 정보를 찾을 수 없습니다.",
      HTTP_CODE.NOT_FOUND
    );
  }

  // 비밀번호 검증
  const isPasswordValid = await verifyPassword(password, user.password);
  if (!isPasswordValid) {
    throw new ApiError(
      HTTP_STATUS.UNAUTHORIZED,
      "이메일 또는 비밀번호가 일치하지 않습니다.",
      HTTP_CODE.UNAUTHORIZED
    );
  }

  const accessToken = generateToken({ id: user.id });
  const newRefreshToken = generateRefreshToken({ id: user.id });

  // refreshToken HTTP-only 쿠키에 저장
  setRefreshTokenCookie(res, newRefreshToken, req);

  const { password: _, ...userWithoutPassword } = user;
  return { ...userWithoutPassword, accessToken };
}

async function logout(res: Response) {
  // TODO. 향후 필요시 아래 로직 추가 가능:
  // - DB에 refreshToken 저장 시: 토큰 검증 후 DB에서 무효화
  // - Token blacklist 사용 시: 검증 후 블랙리스트에 추가
  // - 로그아웃한 토큰 추적 필요 시: 검증 후 로그 기록
  clearRefreshTokenCookie(res);
}

async function refresh(refreshToken: string, res: Response) {
  let decoded;
  try {
    // refreshToken 유효성 검증 및 에러 핸들링
    decoded = verifyToken(refreshToken);
  } catch (error) {
    // refreshToken이 유효하지 않거나 만료된 경우 쿠키 삭제 후 에러 반환
    // TODO: 프론트엔드에서 401 에러를 받으면 자동 로그아웃 처리 추가할 것
    clearRefreshTokenCookie(res);
    throw error; // verifyToken이 이미 ApiError를 던지므로 그대로 전달
  }

  // jwt.verify는 string | JwtPayload를 반환할 수 있으므로 타입 체크 필요
  if (typeof decoded !== "object" || decoded === null || !("id" in decoded)) {
    // 타입이 맞지 않으면 쿠키 삭제 후 에러 반환
    clearRefreshTokenCookie(res);
    throw new ApiError(
      HTTP_STATUS.UNAUTHORIZED,
      "유효하지 않은 리프레시 토큰입니다. 다시 로그인해주세요.",
      HTTP_CODE.UNAUTHORIZED
    );
  }

  // 토큰이 유효하더라도 사용자가 삭제되었을 수 있으므로 사용자 존재 여부 확인
  const user = await authRepository.findUserById(decoded.id);
  if (!user) {
    // 사용자가 삭제된 경우 쿠키 삭제 후 에러 반환
    clearRefreshTokenCookie(res);
    throw new ApiError(
      HTTP_STATUS.NOT_FOUND,
      "사용자 정보를 찾을 수 없습니다. 다시 로그인해주세요.",
      HTTP_CODE.NOT_FOUND
    );
  }

  // 새로운 토큰 생성
  const newAccessToken = generateToken({ id: user.id });
  const newRefreshToken = generateRefreshToken({ id: user.id });

  // refreshToken HTTP-only 쿠키에 저장
  setRefreshTokenCookie(res, newRefreshToken);

  // accessToken만 반환 (localStorage에 저장할 예정)
  return { accessToken: newAccessToken };
}

async function me(id: string) {
  const user = await authRepository.findUserById(id);
  if (!user) {
    throw new ApiError(
      HTTP_STATUS.NOT_FOUND,
      "사용자 정보를 찾을 수 없습니다.",
      HTTP_CODE.NOT_FOUND
    );
  }
  return user;
}

export default {
  signup,
  login,
  logout,
  refresh,
  me,
};
