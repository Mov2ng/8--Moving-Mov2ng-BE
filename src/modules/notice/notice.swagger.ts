/**
 * @openapi
 * components:
 *   schemas:
 *     NoticeItem:
 *       type: object
 *       properties:
 *         noticeId:
 *           type: string
 *           example: "12"
 *         audience:
 *           type: string
 *           enum: [USER, DRIVER]
 *           example: USER
 *         noticeType:
 *           type: string
 *           enum: [NEW_ORDER, ORDER_ACCSESS, MOVE_TIME]
 *         title:
 *           type: string
 *           example: "새로운 견적이 도착했습니다"
 *         content:
 *           type: string
 *           example: "홍길동님이 견적을 보냈습니다"
 *         noticeDate:
 *           type: string
 *           format: date-time
 *         requestId:
 *           type: integer
 *           nullable: true
 *           example: 900001
 *         estimateId:
 *           type: integer
 *           nullable: true
 *           example: 30001
 *         movingDate:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         daysUntil:
 *           type: integer
 *           nullable: true
 *           example: 3
 *         requesterName:
 *           type: string
 *           nullable: true
 *           example: "홍길동"
 *         requesterId:
 *           type: string
 *           nullable: true
 *         driverName:
 *           type: string
 *           nullable: true
 *           example: "김기사"
 *         driverId:
 *           type: integer
 *           nullable: true
 *           example: 42
 *     NoticeListResponse:
 *       type: object
 *       properties:
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/NoticeItem'
 *         page:
 *           type: integer
 *         pageSize:
 *           type: integer
 *         totalItems:
 *           type: integer
 *         totalPages:
 *           type: integer
 *
 * /notice/user:
 *   get:
 *     summary: 일반 사용자 알림 조회
 *     tags:
 *       - Notice
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: false
 *         schema:
 *           type: string
 *         description: 인증된 사용자 ID (인증 토큰 사용 시 생략 가능)
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: pageSize
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: isDelete
 *         required: false
 *         schema:
 *           type: boolean
 *         description: false = unread only, true = read only, omit = all
 *     responses:
 *       200:
 *         description: 사용자 알림 목록
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NoticeListResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *
 * /notice/driver:
 *   get:
 *     summary: 기사 알림 조회
 *     tags:
 *       - Notice
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: false
 *         schema:
 *           type: string
 *         description: 기사 계정의 사용자 ID (인증 토큰 사용 시 생략 가능)
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: pageSize
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: isDelete
 *         required: false
 *         schema:
 *           type: boolean
 *         description: false = unread only, true = read only, omit = all
 *     responses:
 *       200:
 *         description: 기사 알림 목록
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NoticeListResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *
 * /notice/read/{id}:
 *   post:
 *     summary: 알림 읽음 처리
 *     tags:
 *       - Notice
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: noticeId
 *     responses:
 *       200:
 *         description: 알림 읽음 처리 성공
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *
 * /notice/read/all/{id}:
 *   post:
 *     summary: 알림 전체 읽음 처리
 *     tags:
 *       - Notice
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: userId (인증 토큰 사용 시 아무 값이어도 무시됨)
 *     responses:
 *       200:
 *         description: 알림 전체 읽음 처리 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */

// 트리쉐이킹 방지: 빌드 시 이 파일이 포함되도록 export 추가
export {};
