"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = hashPassword;
exports.verifyPassword = verifyPassword;
const argon2 = __importStar(require("argon2"));
/**
 * 비밀번호 해싱
 * @param plainPwd - 사용자가 입력한 평문 비밀번호
 * @returns 해시 문자열 (DB에 이 문자열만 저장)
 */
async function hashPassword(plainPwd) {
    const options = {
        type: argon2.argon2id, // 암호화 알고리즘 (메모리 기반 + 사이드채널 공격 방어 good)
        memoryCost: 19456, // 해싱에 사용할 메모리 용량
        timeCost: 2, // 해싱 반복 횟수
        parallelism: 1, // 해싱 연산에 사용할 병렬 스레드 수
    };
    // 무작위 솔트 생성 → 결과 해시 문자열에 솔트 포함해 반환
    return argon2.hash(plainPwd, options);
}
/**
 * 비밀번호 검증
 * @param plainPwd - 로그인 시 사용자가 입력한 평문 비밀번호
 * @param storedHash - DB에 저장된 해시 문자열
 * @returns boolean - 일치하면 true, 아니면 false
 */
async function verifyPassword(plainPwd, storedHash) {
    try {
        // 상수 시간 비교 알고리즘 사용해 추가 비교 함수 필요 XX
        const isValid = await argon2.verify(storedHash, plainPwd);
        return isValid;
    }
    catch (error) {
        // 평문 비밀번호 기록 금지
        // 예외 상황(ex. DB에 저장된 값 손상, malformed hash 등)에 false 처리
        // 필요시 로그/모니터링으로 이상 징후 탐지할 것
        return false;
    }
}
//# sourceMappingURL=password.js.map