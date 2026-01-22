/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: 사용자 관련 API
 */

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: 회원가입
 *     tags: [Auth]
 *     description: 회원가입을 진행합니다.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *               - name
 *               - email
 *               - phoneNum
 *               - password
 *               - passwordConfirm
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [USER, DRIVER]
 *                 description: 사용자 역할
 *                 example: USER
 *               name:
 *                 type: string
 *                 description: 이름
 *                 example: 홍길동
 *               email:
 *                 type: string
 *                 format: email
 *                 description: 이메일
 *                 example: user@example.com
 *               phoneNum:
 *                 type: string
 *                 pattern: "^[0-9]+$"
 *                 minLength: 10
 *                 maxLength: 11
 *                 description: 전화번호 (숫자만 입력, 10-11자)
 *                 example: "01012345678"
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 maxLength: 128
 *                 description: 비밀번호 (최소 8자, 영문/숫자/특수문자 포함)
 *                 example: Password123!
 *               passwordConfirm:
 *                 type: string
 *                 format: password
 *                 description: 비밀번호 확인 (password와 일치해야 함)
 *                 example: Password123!
 *     responses:
 *       201:
 *         description: 회원가입 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   description: 회원가입 성공 메시지
 *                   example: 회원가입 성공
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: 사용자 ID
 *                       example: "uuid-string"
 *                     email:
 *                       type: string
 *                       description: 이메일
 *                       example: user@example.com
 *                     phoneNum:
 *                       type: string
 *                       description: 전화번호
 *                       example: "01012345678"
 *                     name:
 *                       type: string
 *                       description: 이름
 *                       example: 홍길동
 *                     role:
 *                       type: string
 *                       enum: [USER, DRIVER]
 *                       description: 역할
 *                       example: USER
 *                     provider:
 *                       type: string
 *                       enum: [LOCAL]
 *                       description: 로그인 공급자
 *                       example: LOCAL
 *       400:
 *         description: 잘못된 요청 (유효성 검사 실패 또는 이미 가입한 계정)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 요청 형식이 올바르지 않습니다.
 *                 code:
 *                   type: string
 *                   example: BAD_REQUEST
 *                 details:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       field:
 *                         type: string
 *                         example: body.email
 *                       reason:
 *                         type: string
 *                         example: 유효한 이메일을 입력해 주세요
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 서버 내부 오류가 발생했습니다.
 *                 code:
 *                   type: string
 *                   example: INTERNAL_ERROR
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: 로그인
 *     tags: [Auth]
 *     description: 로그인을 진행합니다.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *               - email
 *               - password
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [USER, DRIVER]
 *                 description: 사용자 역할
 *                 example: USER
 *               email:
 *                 type: string
 *                 format: email
 *                 description: 이메일
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 description: 비밀번호
 *                 example: password123
 *     responses:
 *       200:
 *         description: 로그인 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   description: 로그인 성공 메시지
 *                   example: 로그인 성공
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: 사용자 ID
 *                       example: "uuid-string"
 *                     email:
 *                       type: string
 *                       description: 이메일
 *                       example: user@example.com
 *                     phoneNum:
 *                       type: string
 *                       description: 전화번호
 *                       example: "01012345678"
 *                     name:
 *                       type: string
 *                       description: 이름
 *                       example: 홍길동
 *                     role:
 *                       type: string
 *                       enum: [USER, DRIVER]
 *                       description: 역할
 *                       example: USER
 *                     provider:
 *                       type: string
 *                       enum: [LOCAL]
 *                       description: 로그인 공급자
 *                       example: LOCAL
 *                     accessToken:
 *                       type: string
 *                       description: JWT 액세스 토큰
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: 잘못된 요청 (유효성 검사 실패 또는 이미 로그인한 상태)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 요청 형식이 올바르지 않습니다.
 *                 code:
 *                   type: string
 *                   example: BAD_REQUEST
 *                 details:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       field:
 *                         type: string
 *                         example: body.email
 *                       reason:
 *                         type: string
 *                         example: 유효한 이메일을 입력해 주세요
 *       401:
 *         description: 인증 실패 (이메일 또는 비밀번호 불일치)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 이메일 또는 비밀번호가 일치하지 않습니다
 *                 code:
 *                   type: string
 *                   example: UNAUTHORIZED
 *       404:
 *         description: 사용자를 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 사용자 정보를 찾을 수 없습니다.
 *                 code:
 *                   type: string
 *                   example: NOT_FOUND
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 서버 내부 오류가 발생했습니다.
 *                 code:
 *                   type: string
 *                   example: INTERNAL_ERROR
 */

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: 로그아웃
 *     tags: [Auth]
 *     description: 로그아웃을 진행합니다. 리프레시 토큰은 쿠키에서 자동으로 읽어옵니다.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: cookie
 *         name: refreshToken
 *         required: false
 *         schema:
 *           type: string
 *         description: HTTP-only 쿠키에 저장된 리프레시 토큰 (선택사항)
 *     responses:
 *       200:
 *         description: 로그아웃 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 로그아웃 성공
 *                 data:
 *                   type: null
 *                   nullable: true
 *       401:
 *         description: 인증 실패 (액세스 토큰이 없거나 유효하지 않음)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 인증이 필요합니다
 *                 code:
 *                   type: string
 *                   example: AUTH_REQUIRED
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 서버 내부 오류가 발생했습니다.
 *                 code:
 *                   type: string
 *                   example: INTERNAL_ERROR
 */

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: 토큰 갱신
 *     tags: [Auth]
 *     description: 리프레시 토큰을 사용하여 새로운 액세스 토큰과 리프레시 토큰을 발급합니다. 리프레시 토큰은 쿠키에서 자동으로 읽어옵니다.
 *     security: []
 *     parameters:
 *       - in: cookie
 *         name: refreshToken
 *         required: true
 *         schema:
 *           type: string
 *         description: HTTP-only 쿠키에 저장된 리프레시 토큰
 *     responses:
 *       200:
 *         description: 토큰 갱신 성공
 *         headers:
 *           Set-Cookie:
 *             description: 새로운 리프레시 토큰이 HTTP-only 쿠키에 설정됩니다.
 *             schema:
 *               type: string
 *               example: refreshToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; HttpOnly; SameSite=Strict; Max-Age=604800
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   description: 토큰 갱신 성공 메시지
 *                   example: 토큰 갱신 성공
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                       description: 새로운 JWT 액세스 토큰 (2시간 만료)
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: 잘못된 요청 (리프레시 토큰이 쿠키에 없음)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 요청 형식이 올바르지 않습니다.
 *                 code:
 *                   type: string
 *                   example: BAD_REQUEST
 *                 details:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       field:
 *                         type: string
 *                         example: cookies.refreshToken
 *                       reason:
 *                         type: string
 *                         example: 리프레시 토큰이 필요합니다
 *       401:
 *         description: 인증 실패 (리프레시 토큰이 유효하지 않거나 만료됨)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 유효하지 않은 토큰입니다.
 *                 code:
 *                   type: string
 *                   example: AUTH_INVALID_TOKEN
 *       404:
 *         description: 사용자를 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 사용자 정보를 찾을 수 없습니다. 다시 로그인해주세요.
 *                 code:
 *                   type: string
 *                   example: NOT_FOUND
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 서버 내부 오류가 발생했습니다.
 *                 code:
 *                   type: string
 *                   example: INTERNAL_ERROR
 */

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: 사용자 정보 조회
 *     tags: [Auth]
 *     description: 현재 로그인한 사용자의 정보를 조회합니다. JWT 토큰이 필요합니다.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 사용자 정보 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   description: 사용자 정보 조회 성공 메시지
 *                   example: 내 정보 조회 성공
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: 사용자 ID
 *                       example: "uuid-string"
 *                     email:
 *                       type: string
 *                       description: 이메일
 *                       example: user@example.com
 *                     phoneNum:
 *                       type: string
 *                       description: 전화번호
 *                       example: "01012345678"
 *                     name:
 *                       type: string
 *                       description: 이름
 *                       example: 홍길동
 *                     role:
 *                       type: string
 *                       enum: [USER, DRIVER]
 *                       description: 역할
 *                       example: USER
 *                     provider:
 *                       type: string
 *                       enum: [LOCAL]
 *                       description: 로그인 공급자
 *                       example: LOCAL
 *       401:
 *         description: 인증 실패 (토큰이 없거나 유효하지 않음)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 인증이 필요합니다
 *                 code:
 *                   type: string
 *                   example: AUTH_REQUIRED
 *       404:
 *         description: 사용자를 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 사용자 정보를 찾을 수 없습니다.
 *                 code:
 *                   type: string
 *                   example: NOT_FOUND
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 서버 내부 오류가 발생했습니다.
 *                 code:
 *                   type: string
 *                   example: INTERNAL_ERROR
 */

// 트리쉐이킹 방지: 빌드 시 이 파일이 포함되도록 export 추가
export {};
