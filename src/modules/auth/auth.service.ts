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
import env from "../../config/env";
import { Role } from "@prisma/client";

/**
 * refreshToken 쿠키 설정 유틸 함수
 * - HTTP-only 쿠키로 설정하여 XSS 공격 방지
 * - secure 옵션으로 HTTPS에서만 전송 (프로덕션 환경)
 * - sameSite: strict로 CSRF 공격 방지
 * @param res Express Response 객체
 * @param refreshToken 설정할 refreshToken 문자열
 */
function setRefreshTokenCookie(res: Response, refreshToken: string) {
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true, // JS 접근 불가 (XSS 공격 방지)
    secure: env.NODE_ENV === "production", // HTTPS에서만 전송
    sameSite: "strict", // CSRF 공격 방지
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7일
  });
}

/**
 * refreshToken 쿠키 삭제 유틸 함수
 * - 로그아웃 또는 토큰 만료 시 쿠키 삭제
 * @param res Express Response 객체
 */
function clearRefreshTokenCookie(res: Response) {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict",
  });
}

async function signup(
  name: string,
  email: string,
  phoneNum: string,
  password: string,
  role: string
) {
  if (role !== "USER" && role !== "DRIVER") {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "role은 'USER' 또는 'DRIVER'만 가능합니다.",
      HTTP_CODE.BAD_REQUEST
    );
  }

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
  // role 검증
  if (role !== "USER" && role !== "DRIVER") {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "role은 'USER' 또는 'DRIVER'만 가능합니다.",
      HTTP_CODE.BAD_REQUEST
    );
  } // 근데 role 검증은 이미 zod schema에서 했는데도 필요함??

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
  setRefreshTokenCookie(res, newRefreshToken);

  const { password: _, ...userWithoutPassword } = user;
  return { ...userWithoutPassword, accessToken };
}

async function logout(refreshToken: string) {
  // const decoded: JwtPayload = verifyToken(refreshToken);
  // if (!decoded) {
  //   throw new ApiError(
  //     HTTP_STATUS.UNAUTHORIZED,
  //     "리프레시 토큰이 유효하지 않습니다.",
  //     HTTP_CODE.UNAUTHORIZED
  //   );
  // }
  // await authRepository.updateUser(decoded.id, { refreshToken: null });
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
