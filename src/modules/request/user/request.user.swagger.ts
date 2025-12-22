/**
 * @openapi
 * /request/user/quotes:
 *   get:
 *     summary: 받은 견적 목록 조회
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, ACCEPTED, REJECTED]
 *         description: 상태 필터 (없으면 전체)
 *       - in: query
 *         name: requestId
 *         schema:
 *           type: integer
 *         description: 특정 요청에 대한 견적만 조회
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
 *
 * /request/user/quotes/pending/{estimateId}:
 *   get:
 *     summary: 대기중인 견적 상세 조회
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: estimateId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 견적 ID (숫자)
 *     responses:
 *       200:
 *         description: 대기중 견적 상세 조회 성공
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
 *         description: 잘못된 estimateId
 *       401:
 *         description: 인증 필요
 *       404:
 *         description: 견적 없음
 *
 * /request/user/quotes/pending/{estimateId}/accept:
 *   post:
 *     summary: 견적 확정
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: estimateId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 견적 ID (숫자)
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
 *         description: 잘못된 estimateId
 *       401:
 *         description: 인증 필요
 *       404:
 *         description: 견적 없음
 *
 * components:
 *   schemas:
 *     QuoteDetail:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         status:
 *           type: string
 *           enum: [PENDING, ACCEPTED, REJECTED]
 *           example: ACCEPTED
 *         price:
 *           type: integer
 *           example: 180000
 *         request:
 *           type: object
 *           properties:
 *             moving_type:
 *               type: string
 *               example: SMALL
 *             moving_data:
 *               type: string
 *               format: date-time
 *             origin:
 *               type: string
 *               example: 서울시 강남구
 *             destination:
 *               type: string
 *               example: 서울시 서초구
 *             createdAt:
 *               type: string
 *               format: date-time
 *         driver:
 *           type: object
 *           properties:
 *             nickname:
 *               type: string
 *               example: 친절한기사1
 *             driver_years:
 *               type: integer
 *               nullable: true
 *               example: 5
 *             driver_intro:
 *               type: string
 *               nullable: true
 *               example: 고객님의 물품을 안전하게 운송해 드립니다.
 *             rating:
 *               type: number
 *               example: 4.9
 *             reviewCount:
 *               type: integer
 *               example: 12
 *             likeCount:
 *               type: integer
 *               example: 5
 *             confirmedCount:
 *               type: integer
 *               example: 3
 */
