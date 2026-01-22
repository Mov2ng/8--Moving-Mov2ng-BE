/**
 * @openapi
 * /review:
 *   get:
 *     summary: 리뷰 목록 조회
 *     description: 리뷰 목록을 조회합니다. 드라이버 ID, 사용자 ID, 내가 받은 견적 필터링이 가능합니다.
 *     tags:
 *       - Review
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: driverId
 *         schema:
 *           type: integer
 *         description: 특정 드라이버에 대한 리뷰만 조회
 *         example: 1
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: 특정 사용자(작성자) 리뷰만 조회
 *         example: "user123"
 *       - in: query
 *         name: onlyMyQuotes
 *         schema:
 *           type: string
 *           enum: [true, false, 1, 0]
 *         description: true일 때 내가 받은 견적의 기사 리뷰만 조회
 *         example: true
 *     responses:
 *       200:
 *         description: 리뷰 조회 성공
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
 *                   example: 리뷰 조회에 성공했습니다.
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Review'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 *
 *   post:
 *     summary: 리뷰 작성
 *     description: 확정된 이사 완료 이력이 있는 기사에게 리뷰를 작성합니다.
 *     tags:
 *       - Review
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - driverId
 *               - rating
 *             properties:
 *               driverId:
 *                 type: integer
 *                 description: 기사 ID
 *                 example: 1
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 description: 평점 (1~5점)
 *                 example: 5
 *               review_title:
 *                 type: string
 *                 description: 리뷰 제목 (선택)
 *                 example: "정말 만족스러운 이사였어요"
 *               review_content:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 1000
 *                 description: 리뷰 내용 (10자 이상 1000자 이하)
 *                 example: "이번 이사 견적 상담 정말 만족스러웠어요. 상담해주신 기사님이 하나하나 꼼꼼하다 싶을 정도로 체크해 주셔서 신뢰가 갔고, 질문할 때마다 너무 친절하다는 느낌을 받았습니다."
 *     responses:
 *       201:
 *         description: 리뷰 작성 성공
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
 *                   example: 리뷰 작성에 성공했습니다.
 *                 data:
 *                   $ref: '#/components/schemas/Review'
 *       400:
 *         $ref: '#/components/responses/ReviewBadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       409:
 *         $ref: '#/components/responses/ReviewConflict'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 *
 * /review/writable:
 *   get:
 *     summary: 작성 가능한 리뷰 조회
 *     description: 이사 완료 + 내가 확정한 견적 중 아직 리뷰를 작성하지 않은 항목만 조회합니다.
 *     tags:
 *       - Review
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 작성 가능한 리뷰 조회 성공
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
 *                   example: 작성 가능한 리뷰 조회에 성공했습니다.
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/WritableReview'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 *
 * /review/my:
 *   get:
 *     summary: 내가 작성한 리뷰 조회
 *     description: 현재 로그인한 사용자가 작성한 모든 리뷰를 조회합니다.
 *     tags:
 *       - Review
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 내가 작성한 리뷰 조회 성공
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
 *                   example: 내가 작성한 리뷰 조회에 성공했습니다.
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Review'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 *
 * components:
 *   schemas:
 *     Review:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 리뷰 ID
 *           example: 1
 *         driver_id:
 *           type: integer
 *           description: 기사 ID
 *           example: 1
 *         user_id:
 *           type: string
 *           description: 작성자 ID
 *           example: "user123"
 *         rating:
 *           type: integer
 *           description: 평점 (1~5)
 *           example: 5
 *         review_title:
 *           type: string
 *           nullable: true
 *           description: 리뷰 제목
 *           example: "정말 만족스러운 이사였어요"
 *         review_content:
 *           type: string
 *           nullable: true
 *           description: 리뷰 내용
 *           example: "이번 이사 견적 상담 정말 만족스러웠어요..."
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 작성일
 *           example: "2024-01-05T00:48:15.841Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 수정일
 *           example: "2024-01-05T00:48:15.841Z"
 *
 *     WritableReview:
 *       type: object
 *       description: 작성 가능한 리뷰 정보 (이사 완료 + 확정한 견적)
 *       properties:
 *         estimateId:
 *           type: integer
 *           description: 견적 ID
 *           example: 1
 *         driverId:
 *           type: integer
 *           description: 기사 ID
 *           example: 1
 *         driverNickname:
 *           type: string
 *           description: 기사 닉네임
 *           example: "친절한기사1"
 *         movingDate:
 *           type: string
 *           format: date-time
 *           description: 이사일
 *           example: "2024-12-20T10:00:00.000Z"
 *
 *   responses:
 *     Unauthorized:
 *       description: 인증 실패
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               message:
 *                 type: string
 *                 example: 로그인이 필요한 서비스입니다.
 *               code:
 *                 type: string
 *                 example: AUTH_REQUIRED
 *
 *     Forbidden:
 *       description: 권한 없음
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               message:
 *                 type: string
 *                 example: 접근 권한이 없습니다.
 *               code:
 *                 type: string
 *                 example: FORBIDDEN
 *
 *     BadRequest:
 *       description: 잘못된 요청
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               message:
 *                 type: string
 *                 example: 잘못된 요청입니다.
 *               code:
 *                 type: string
 *                 example: BAD_REQUEST
 *
 *     ReviewBadRequest:
 *       description: 리뷰 작성 실패 (확정된 이사 완료 이력 없음)
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               message:
 *                 type: string
 *                 example: 확정된 이사 완료 이력이 있어야 리뷰를 작성할 수 있습니다.
 *               code:
 *                 type: string
 *                 example: BAD_REQUEST
 *
 *     ReviewConflict:
 *       description: 중복 리뷰 (이미 해당 기사에게 리뷰를 작성함)
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               message:
 *                 type: string
 *                 example: 이미 해당 기사에게 리뷰를 작성했습니다.
 *               code:
 *                 type: string
 *                 example: BAD_REQUEST
 *
 *     ValidationError:
 *       description: 유효성 검증 실패
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               message:
 *                 type: string
 *                 example: 요청 형식이 올바르지 않습니다.
 *               code:
 *                 type: string
 *                 example: VALIDATION_ERROR
 *               details:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     field:
 *                       type: string
 *                       example: review_content
 *                     reason:
 *                       type: string
 *                       example: 내용은 10자 이상 1000자 이하여야 합니다.
 *
 *     InternalError:
 *       description: 서버 오류
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               message:
 *                 type: string
 *                 example: 서버 내부 오류가 발생했습니다.
 *               code:
 *                 type: string
 *                 example: INTERNAL_ERROR
 */

// 트리쉐이킹 방지: 빌드 시 이 파일이 포함되도록 export 추가
export {};
