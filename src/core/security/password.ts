import * as argon2 from "argon2";

/**
 * 비밀번호 해싱
 * @param plainPwd - 사용자가 입력한 평문 비밀번호
 * @returns 해시 문자열 (DB에 이 문자열만 저장)
 */
export async function hashPassword(plainPwd: string): Promise<string> {
  const options: argon2.Options = {
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
export async function verifyPassword(
  plainPwd: string,
  storedHash: string
): Promise<boolean> {
  // 입력값 검증
  if (!plainPwd || !storedHash) {
    console.log("[verifyPassword] 입력값 누락:", {
      hasPlainPwd: !!plainPwd,
      hasStoredHash: !!storedHash,
    });
    return false;
  }

  // argon2 해시는 항상 $argon2로 시작해야 함
  if (!storedHash.startsWith("$argon2")) {
    console.log(
      "[verifyPassword] 잘못된 해시 형식:",
      storedHash.substring(0, 20)
    );
    return false;
  }

  try {
    // 상수 시간 비교 알고리즘 사용해 추가 비교 함수 필요 XX
    const isValid = await argon2.verify(storedHash, plainPwd);

    return isValid;
  } catch (error) {
    // 평문 비밀번호 기록 금지
    // 예외 상황(ex. DB에 저장된 값 손상, malformed hash 등)에 false 처리
    // 필요시 로그/모니터링으로 이상 징후 탐지할 것
    return false;
  }
}
