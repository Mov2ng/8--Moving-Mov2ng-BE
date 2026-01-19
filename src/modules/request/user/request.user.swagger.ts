/**
 * @openapi
 * /request/user/estimates:
 *   get:
 *     summary: 받은 견적 목록 조회
 *     description: 사용자가 받은 견적 목록을 조회합니다. 상태, 요청 ID, 이사일 필터링이 가능합니다.
 *     tags:
 *       - User Request
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, ACCEPTED, REJECTED, COMPLETED]
 *         description: 상태 필터 (없으면 전체 조회)
 *         example: ACCEPTED
 *       - in: query
 *         name: requestId
 *         schema:
 *           type: integer
 *         description: 특정 요청에 대한 견적만 조회
 *         example: 1
 *       - in: query
 *         name: completedOnly
 *         schema:
 *           type: string
 *           enum: [true, false, 1, 0]
 *         description: 이사일이 지난 견적만 조회 (true 또는 1일 때만 필터링)
 *         example: true
 *     responses:
 *       200:
 *         description: 받은 견적 목록 조회 성공
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
 *                   example: 받은 견적 조회에 성공했습니다.
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/QuoteDetail'
 *       401:
 *         description: 인증 필요
 *       403:
 *         description: 권한 없음 (일반 유저만 접근 가능)
 *
 * /request/user/estimates/{estimateId}:
 *   get:
 *     summary: 견적 상세 조회 (상태 무관)
 *     description: 특정 견적의 상세 정보를 조회합니다. 상태와 관계없이 조회 가능합니다.
 *     tags:
 *       - User Request
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: estimateId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 견적 ID
 *         example: 1
 *     responses:
 *       200:
 *         description: 견적 상세 조회 성공
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
 *                   example: 견적 상세 조회에 성공했습니다.
 *                 data:
 *                   $ref: '#/components/schemas/QuoteDetail'
 *       400:
 *         description: 잘못된 estimateId 형식
 *       401:
 *         description: 인증 필요
 *       403:
 *         description: 권한 없음 (일반 유저만 접근 가능)
 *       404:
 *         description: 견적을 찾을 수 없음
 *
 * /request/user/estimates/{estimateId}/pending:
 *   get:
 *     summary: 대기중인 견적 상세 조회
 *     description: ACCEPTED 상태인 견적의 상세 정보를 조회합니다.
 *     tags:
 *       - User Request
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: estimateId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 견적 ID
 *         example: 1
 *     responses:
 *       200:
 *         description: 대기중인 견적 상세 조회 성공
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
 *                   example: 대기중인 견적 상세 조회에 성공했습니다.
 *                 data:
 *                   $ref: '#/components/schemas/QuoteDetail'
 *       400:
 *         description: 잘못된 estimateId 형식
 *       401:
 *         description: 인증 필요
 *       403:
 *         description: 권한 없음 (일반 유저만 접근 가능)
 *       404:
 *         description: 견적을 찾을 수 없음 (ACCEPTED 상태가 아니거나 존재하지 않음)
 *
 * /request/user/estimates/{estimateId}/pending/accept:
 *   post:
 *     summary: 견적 확정
 *     description: ACCEPTED 상태인 견적을 COMPLETED 상태로 변경합니다.
 *     tags:
 *       - User Request
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: estimateId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 견적 ID
 *         example: 1
 *     responses:
 *       200:
 *         description: 견적 확정 성공
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
 *                   example: 견적 확정에 성공했습니다.
 *                 data:
 *                   $ref: '#/components/schemas/QuoteDetail'
 *       400:
 *         description: 잘못된 estimateId 형식
 *       401:
 *         description: 인증 필요
 *       403:
 *         description: 권한 없음 (일반 유저만 접근 가능)
 *       404:
 *         description: 견적을 찾을 수 없음 (ACCEPTED 상태가 아니거나 존재하지 않음)
 *
 * components:
 *   schemas:
 *     QuoteDetail:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 견적 ID
 *           example: 1
 *         status:
 *           type: string
 *           enum: [PENDING, ACCEPTED, REJECTED, COMPLETED]
 *           description: 견적 상태
 *           example: ACCEPTED
 *         price:
 *           type: integer
 *           description: 견적 가격
 *           example: 180000
 *         request:
 *           type: object
 *           description: 이사 요청 정보
 *           properties:
 *             moving_type:
 *               type: string
 *               description: 이사 유형
 *               example: SMALL
 *             moving_data:
 *               type: string
 *               format: date-time
 *               description: 이사 예정일
 *               example: "2024-12-20T10:00:00.000Z"
 *             origin:
 *               type: string
 *               description: 출발지
 *               example: 서울시 강남구
 *             destination:
 *               type: string
 *               description: 도착지
 *               example: 서울시 서초구
 *             createdAt:
 *               type: string
 *               format: date-time
 *               description: 요청 생성일
 *               example: "2024-01-05T00:48:15.841Z"
 *         driver:
 *           type: object
 *           description: 기사 정보
 *           properties:
 *             id:
 *               type: integer
 *               description: 기사 ID
 *               example: 1
 *             nickname:
 *               type: string
 *               description: 기사 닉네임
 *               example: 친절한기사1
 *             driver_years:
 *               type: integer
 *               nullable: true
 *               description: 경력 연수
 *               example: 5
 *             driver_intro:
 *               type: string
 *               nullable: true
 *               description: 기사 소개
 *               example: 고객님의 물품을 안전하게 운송해 드립니다.
 *             rating:
 *               type: number
 *               format: float
 *               description: 평균 평점
 *               example: 4.9
 *             reviewCount:
 *               type: integer
 *               description: 리뷰 개수
 *               example: 12
 *             likeCount:
 *               type: integer
 *               description: 좋아요 개수
 *               example: 5
 *             confirmedCount:
 *               type: integer
 *               description: 확정 건수
 *               example: 3
 *             isFavorite:
 *               type: boolean
 *               description: 즐겨찾기 여부
 *               example: true
 */
