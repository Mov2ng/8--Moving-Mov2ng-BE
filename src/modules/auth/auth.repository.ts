import prisma from "../../config/db";
import { Role, Prisma } from "@prisma/client";

type TxClient = Prisma.TransactionClient;

/**
 * 사용자 정보 생성
 * @param name 사용자 이름
 * @param email 사용자 이메일
 * @param phoneNum 사용자 전화번호
 * @param hashedPassword 이미 해싱된 비밀번호
 */
async function createUser(
  name: string,
  email: string,
  phoneNum: string,
  hashedPassword: string,
  role: Role,
  tx: TxClient = prisma
) {
  return tx.user.create({
    data: {
      name,
      email,
      phone_number: phoneNum,
      password: hashedPassword,
      role,
    },
  });
}

/**
 * 사용자 ID로 사용자 정보 조회
 * @param id 사용자 ID
 * @returns 사용자 정보
 */
function findUserById(id: string, tx: TxClient = prisma) {
  return tx.user.findFirst({
    where: {
      id,
      isDelete: false, // 삭제되지 않은 사용자만 조회
    },
  });
}

/**
 * 사용자 이메일로 사용자 정보 조회
 * @param email 사용자 이메일
 * @param role 사용자 역할
 * @returns 사용자 정보
 */
async function findUserByEmailAndRole(
  email: string,
  role: Role,
  tx: TxClient = prisma
) {
  return tx.user.findFirst({
    where: {
      email,
      role,
      isDelete: false,
    },
  });
}

/**
 * 사용자 정보 업데이트
 * @param id 사용자 ID
 * @param name 사용자 이름
 * @param email 사용자 이메일
 * @param phoneNum 사용자 전화번호
 * @param password 사용자 비밀번호
 */
function updateUser(
  id: string,
  name: string,
  email: string,
  phoneNum: string,
  password: string,
  tx: TxClient = prisma
) {
  return tx.user.update({
    where: {
      id,
    },
    data: {
      name,
      email,
      phone_number: phoneNum,
      password,
    },
  });
}

export default {
  createUser,
  findUserById,
  findUserByEmailAndRole,
  updateUser,
};
