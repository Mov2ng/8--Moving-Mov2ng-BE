"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../../config/db"));
/**
 * 사용자 정보 생성
 * @param name 사용자 이름
 * @param email 사용자 이메일
 * @param phoneNum 사용자 전화번호
 * @param hashedPassword 이미 해싱된 비밀번호
 */
async function createUser(name, email, phoneNum, hashedPassword, role) {
    return db_1.default.user.create({
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
function findUserById(id) {
    return db_1.default.user.findUnique({
        where: { id },
    });
}
/**
 * 사용자 이메일로 사용자 정보 조회
 * @param email 사용자 이메일
 * @param role 사용자 역할
 * @returns 사용자 정보
 */
function findUserByEmailAndRole(email, role) {
    return db_1.default.user.findFirst({
        where: {
            email,
            role,
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
function updateUser(id, name, email, phoneNum, password) {
    return db_1.default.user.update({
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
exports.default = {
    createUser,
    findUserById,
    findUserByEmailAndRole,
    updateUser,
};
//# sourceMappingURL=auth.repository.js.map