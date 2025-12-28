import prisma from "../../config/db";
import { Prisma, Role, User } from "@prisma/client";

/**
 * 사용자 정보 생성
 * @param tx 트랜잭션 클라이언트
 * @param name 사용자 이름
 * @param email 사용자 이메일
 * @param phoneNum 사용자 전화번호
 * @param hashedPassword 이미 해싱된 비밀번호
 */
async function createUser(
  tx: Prisma.TransactionClient = prisma,
  name: string,
  email: string,
  phoneNum: string,
  hashedPassword: string,
  role: Role
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
 * @param tx 트랜잭션 클라이언트
 * @param id 사용자 ID
 * @returns 사용자 정보
 */
function findUserById(
  tx: Prisma.TransactionClient = prisma,
  id: string
) {
  return tx.user.findUnique({
    where: { id },
  });
}

/**
 * 사용자 이메일로 사용자 정보 조회
 * @param tx 트랜잭션 클라이언트
 * @param email 사용자 이메일
 * @param role 사용자 역할
 * @returns 사용자 정보
 */
function findUserByEmailAndRole(
  tx: Prisma.TransactionClient = prisma,
  email: string,
  role: Role
) {
  return tx.user.findFirst({
    where: {
      email,
      role,
    },
  });
}

/**
 * 사용자 정보 업데이트
 * @param tx 트랜잭션 클라이언트
 * @param id 사용자 ID
 * @param data 사용자 정보
 */
function updateUser(
  tx: Prisma.TransactionClient = prisma,
  id: string,
  data: Prisma.UserUpdateInput
): Promise<User> {
  return tx.user.update({
    where: { id },
    data,
  });
}
export default {
  createUser,
  findUserById,
  findUserByEmailAndRole,
  updateUser,
};
