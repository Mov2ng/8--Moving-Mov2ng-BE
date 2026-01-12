/**
 * @swagger
 * tags:
 *   - name: User
 *     description: 사용자 관련 API
 */

/**
 * @swagger
 * /user/profile:
 *   post:
 *     summary: 프로필 생성
 *     tags: [User]
 *     description: 사용자 프로필을 생성합니다. 일반 회원(USER)과 기사(DRIVER)에 따라 요청 필드가 다릅니다.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               profileImage:
 *                 type: string
 *                 description: 프로필 이미지 URL (선택)
 *                 example: "https://example.com/profile.jpg"
 *               serviceCategories:
 *                 type: array
 *                 description: 서비스 카테고리 목록 (선택)
 *                 items:
 *                   type: string
 *                   enum: [SMALL, HOME, OFFICE]
 *                 example: [SMALL, HOME]
 *               region:
 *                 type: array
 *                 description: 서비스 지역 목록 (선택)
 *                 items:
 *                   type: string
 *                   enum: [SEOUL, GYEONGGI, INCHEON, GANGWON, CHUNGBUK, CHUNGNAM, SEJONG, DAEJEON, JEONBUK, JEONNAM, GWANGJU, GYEONGBUK, GYEONGNAM, BUSAN, ULSAN, JEJU]
 *                 example: [SEOUL, GYEONGGI]
 *               nickname:
 *                 type: string
 *                 description: 닉네임 (기사만 필수, 일반 회원은 사용 불가)
 *                 minLength: 1
 *                 maxLength: 50
 *                 example: "이사왕"
 *               driverYears:
 *                 type: number
 *                 description: 운전 경력 (기사만 선택, 일반 회원은 사용 불가)
 *                 example: 5
 *               driverIntro:
 *                 type: string
 *                 description: 기사 소개 (기사만 선택, 일반 회원은 사용 불가)
 *                 example: "안전하고 신속한 이사를 도와드립니다."
 *               driverContent:
 *                 type: string
 *                 description: 기사 상세 내용 (기사만 선택, 일반 회원은 사용 불가)
 *                 example: "10년 이상의 경력으로 고객 만족을 최우선으로 합니다."
 *     responses:
 *       201:
 *         description: 프로필 생성 성공
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
 *                   description: 성공 메시지
 *                   example: 프로필 생성 성공
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
 *                     profileImage:
 *                       type: string
 *                       nullable: true
 *                       description: 프로필 이미지 URL
 *                       example: "https://example.com/profile.jpg"
 *                     serviceCategories:
 *                       type: array
 *                       description: 서비스 카테고리 목록
 *                       items:
 *                         type: string
 *                         enum: [SMALL, HOME, OFFICE]
 *                       example: [SMALL, HOME]
 *                     region:
 *                       type: array
 *                       description: 서비스 지역 목록
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "uuid-string"
 *                           user_id:
 *                             type: string
 *                             example: "uuid-string"
 *                           region:
 *                             type: string
 *                             enum: [SEOUL, GYEONGGI, INCHEON, GANGWON, CHUNGBUK, CHUNGNAM, SEJONG, DAEJEON, JEONBUK, JEONNAM, GWANGJU, GYEONGBUK, GYEONGNAM, BUSAN, ULSAN, JEJU]
 *                             example: SEOUL
 *                     driver:
 *                       type: array
 *                       description: 기사 정보 (기사인 경우에만 존재)
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "uuid-string"
 *                           user_id:
 *                             type: string
 *                             example: "uuid-string"
 *                           nickname:
 *                             type: string
 *                             example: "이사왕"
 *                           driver_years:
 *                             type: number
 *                             nullable: true
 *                             example: 5
 *                           driver_intro:
 *                             type: string
 *                             nullable: true
 *                             example: "안전하고 신속한 이사를 도와드립니다."
 *                           driver_content:
 *                             type: string
 *                             nullable: true
 *                             example: "10년 이상의 경력으로 고객 만족을 최우선으로 합니다."
 *       400:
 *         description: 잘못된 요청 (유효성 검사 실패)
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
 *                         example: body.nickname
 *                       reason:
 *                         type: string
 *                         example: 일반 회원은 닉네임을 사용할 수 없습니다
 *       401:
 *         description: 인증 필요
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
 *                   example: 인증이 필요합니다.
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
 *                   example: 사용자를 찾을 수 없습니다.
 *                 code:
 *                   type: string
 *                   example: USER_NOT_FOUND
 *       409:
 *         description: 프로필이 이미 존재함
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
 *                   example: 프로필이 이미 존재합니다.
 *                 code:
 *                   type: string
 *                   example: PROFILE_ALREADY_EXISTS
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
