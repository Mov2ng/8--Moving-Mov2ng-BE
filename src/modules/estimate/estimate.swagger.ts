/**
 * @swagger
 * tags:
 *   - name: Estimate
 *     description: 견적 요청 관련 API
 */

/**
 * @swagger
 * /estimate:
 *   post:
 *     summary: 견적 요청 생성
 *     tags: [Estimate]
 *     description: |
 *       이사 견적 요청을 생성합니다.
 *       - 로그인이 필요합니다.
 *       - 이미 활성화된 견적 요청(이사 날짜가 지나지 않은)이 있으면 생성할 수 없습니다.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - movingType
 *               - movingDate
 *               - origin
 *               - destination
 *             properties:
 *               movingType:
 *                 type: string
 *                 enum: [SMALL, HOME, OFFICE]
 *                 description: 이사 유형
 *                 example: HOME
 *               movingDate:
 *                 type: string
 *                 format: date
 *                 description: 이사 예정일 (YYYY-MM-DD)
 *                 example: "2025-12-30"
 *               origin:
 *                 type: string
 *                 description: 출발지 주소
 *                 example: "서울 중구"
 *               destination:
 *                 type: string
 *                 description: 도착지 주소
 *                 example: "서울 종로구"
 *     responses:
 *       200:
 *         description: 견적 요청 생성 성공
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
 *                   example: 견적 생성 성공
 *                 data:
 *                   $ref: '#/components/schemas/EstimateRequest'
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
 *                         example: body.movingDate
 *                       reason:
 *                         type: string
 *                         example: 유효한 날짜를 입력해 주세요
 *       401:
 *         description: 인증 실패
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
 *       409:
 *         description: 이미 활성화된 견적 요청이 존재함
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
 *                   example: 이미 진행 중인 견적 요청이 있습니다.
 *                 code:
 *                   type: string
 *                   example: CONFLICT
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
 * components:
 *   schemas:
 *     EstimateRequest:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 견적 요청 ID
 *           example: 1
 *         user_id:
 *           type: string
 *           description: 사용자 ID
 *           example: "uuid-string"
 *         moving_type:
 *           type: string
 *           enum: [SMALL, HOME, OFFICE]
 *           description: 이사 유형
 *           example: HOME
 *         moving_data:
 *           type: string
 *           format: date-time
 *           description: 이사 예정일
 *           example: "2025-12-30T00:00:00.000Z"
 *         origin:
 *           type: string
 *           description: 출발지 주소
 *           example: "서울 중구"
 *         destination:
 *           type: string
 *           description: 도착지 주소
 *           example: "서울 종로구"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 생성일시
 *           example: "2025-12-19T10:30:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 수정일시
 *           example: "2025-12-19T10:30:00.000Z"
 */
