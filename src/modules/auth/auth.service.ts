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
import { Role } from "../../generated/prisma";

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
  // 쿠키에서 refreshToken 확인
  const refreshToken = req.cookies?.refreshToken;

  // 이미 로그인 상태인 경우 체크
  if (refreshToken) {
    try {
      // refreshToken 검증 → 성공하면 유효한 토큰이 있다는 의미 = 이미 로그인 상태
      verifyToken(refreshToken);

      // verifyToken이 성공했다면 이미 로그인한 상태
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        "이미 로그인한 상태입니다.",
        HTTP_CODE.BAD_REQUEST
      );
    } catch (error) {
      // "이미 로그인 상태" 에러는 다시 throw
      if (
        error instanceof ApiError &&
        error.statusCode === HTTP_STATUS.BAD_REQUEST
      ) {
        throw error;
      }
      // verifyToken이 실패한 경우 (토큰 만료/무효) → 로그인 진행 허용
      // 에러를 무시하고 로그인 로직 계속 진행
    }
  }

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
  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true, // JS 접근 불가 (XSS 공격 방지)
    secure: env.NODE_ENV === "production", // HTTPS에서만 전송
    sameSite: "strict", // CSRF 공격 방지
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7일
  });

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

export default {
  signup,
  login,
  logout,
};
