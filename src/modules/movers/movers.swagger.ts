/**
 * @swagger
 * tags:
 *   - name: Movers
 *     description: 기사님 관련 API
 */

/**
 * @swagger
 * /movers:
 *   get:
 *     summary: 기사님 목록 조회
 *     tags: [Movers]
 *     description: 기사님 목록을 조회합니다. 로그인 시 즐겨찾기 여부(isFavorite)를 확인할 수 있습니다.
 *     security: []
 *     parameters:
 *       - name: keyword
 *         in: query
 *         description: 기사님 닉네임 검색
 *         required: false
 *         schema:
 *           type: string
 *           example: "홍길동"
 *       - name: region
 *         in: query
 *         description: 지역 필터
 *         required: false
 *         schema:
 *           type: string
 *           enum: [SEOUL, GYEONGGI, INCHEON, GANGWON, CHUNGBUK, CHUNGNAM, SEJONG, DAEJEON, JEONBUK, JEONNAM, GWANGJU, GYEONGBUK, GYEONGNAM, DAEGU, ULSAN, BUSAN, JEJU]
 *       - name: service
 *         in: query
 *         description: 서비스 카테고리 필터
 *         required: false
 *         schema:
 *           type: string
 *           enum: [SMALL, HOME, OFFICE]
 *       - name: sort
 *         in: query
 *         description: 정렬 기준
 *         required: false
 *         schema:
 *           type: string
 *           enum: [review, rating, career, confirm]
 *           default: review
 *       - name: cursor
 *         in: query
 *         description: 무한 스크롤 커서 (마지막 기사님 ID)
 *         required: false
 *         schema:
 *           type: integer
 *       - name: limit
 *         in: query
 *         description: 페이지 크기
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 20
 *     responses:
 *       200:
 *         description: 기사님 목록 조회 성공
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
 *                   example: 기사님 목록 조회 성공
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MoverListItem'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */

/**
 * @swagger
 * /movers/{id}/full:
 *   get:
 *     summary: 기사님 상세 조회 (전체 데이터)
 *     tags: [Movers]
 *     description: 기사님의 전체 상세 정보를 조회합니다. 로그인 시 즐겨찾기 여부를 확인할 수 있습니다.
 *     security: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: 기사님 ID
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: 기사님 상세 조회 성공
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
 *                   example: 기사님 상세 조회 성공
 *                 data:
 *                   $ref: '#/components/schemas/MoverDetailFull'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */

/**
 * @swagger
 * /movers/{id}/extra:
 *   get:
 *     summary: 기사님 상세 조회 (추가 데이터만)
 *     tags: [Movers]
 *     description: 기사님의 추가 데이터만 조회합니다. (리뷰, 견적 등)
 *     security: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: 기사님 ID
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: 기사님 상세 조회 성공
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
 *                   example: 기사님 상세 조회 성공
 *                 data:
 *                   $ref: '#/components/schemas/MoverDetailExtra'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */

/**
 * @swagger
 * /movers/{id}/favorite:
 *   post:
 *     summary: 기사님 즐겨찾기 추가
 *     tags: [Movers]
 *     description: 기사님을 즐겨찾기에 추가합니다. 로그인이 필요합니다.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: 기사님 ID
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: 기사님 즐겨찾기 생성 성공
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
 *                   example: 기사님 즐겨찾기 생성 성공
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: 즐겨찾기 ID
 *                       example: 1
 *                     user_id:
 *                       type: string
 *                       description: 사용자 ID
 *                       example: "uuid-string"
 *                     driver_id:
 *                       type: integer
 *                       description: 기사님 ID
 *                       example: 1
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         description: 이미 즐겨찾기에 추가됨
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
 *                   example: 이미 즐겨찾기에 추가된 기사님입니다.
 *                 code:
 *                   type: string
 *                   example: CONFLICT
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */

/**
 * @swagger
 * /movers/{id}/favorite:
 *   delete:
 *     summary: 기사님 즐겨찾기 삭제
 *     tags: [Movers]
 *     description: 기사님을 즐겨찾기에서 삭제합니다. 로그인이 필요합니다.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: 기사님 ID
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: 기사님 즐겨찾기 삭제 성공
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
 *                   example: 기사님 즐겨찾기 삭제 성공
 *                 data:
 *                   type: null
 *                   nullable: true
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     MoverListItem:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 기사님 ID
 *           example: 1
 *         nickname:
 *           type: string
 *           description: 닉네임
 *           example: "홍길동 기사님"
 *         profileImg:
 *           type: string
 *           description: 프로필 이미지 URL
 *           example: "https://example.com/image.jpg"
 *         driverYears:
 *           type: integer
 *           description: 경력 (년)
 *           example: 5
 *         rating:
 *           type: number
 *           format: float
 *           description: 평점
 *           example: 4.5
 *         reviewCount:
 *           type: integer
 *           description: 리뷰 수
 *           example: 120
 *         favoriteCount:
 *           type: integer
 *           description: 즐겨찾기 수
 *           example: 50
 *         confirmCount:
 *           type: integer
 *           description: 확정 수
 *           example: 200
 *         serviceCategories:
 *           type: array
 *           items:
 *             type: string
 *             enum: [SMALL, HOME, OFFICE]
 *           description: 서비스 카테고리
 *           example: ["SMALL", "HOME"]
 *         serviceRegions:
 *           type: array
 *           items:
 *             type: string
 *           description: 서비스 지역
 *           example: ["SEOUL", "GYEONGGI"]
 *         isFavorite:
 *           type: boolean
 *           description: 즐겨찾기 여부 (로그인 시에만)
 *           example: false
 *
 *     MoverDetailFull:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 기사님 ID
 *           example: 1
 *         nickname:
 *           type: string
 *           description: 닉네임
 *           example: "홍길동 기사님"
 *         profileImg:
 *           type: string
 *           description: 프로필 이미지 URL
 *           example: "https://example.com/image.jpg"
 *         driverYears:
 *           type: integer
 *           description: 경력 (년)
 *           example: 5
 *         driverIntro:
 *           type: string
 *           description: 기사님 소개
 *           example: "안녕하세요, 친절하고 꼼꼼한 이사 서비스를 제공합니다."
 *         rating:
 *           type: number
 *           format: float
 *           description: 평점
 *           example: 4.5
 *         reviewCount:
 *           type: integer
 *           description: 리뷰 수
 *           example: 120
 *         favoriteCount:
 *           type: integer
 *           description: 즐겨찾기 수
 *           example: 50
 *         confirmCount:
 *           type: integer
 *           description: 확정 수
 *           example: 200
 *         serviceCategories:
 *           type: array
 *           items:
 *             type: string
 *             enum: [SMALL, HOME, OFFICE]
 *           description: 서비스 카테고리
 *           example: ["SMALL", "HOME"]
 *         serviceRegions:
 *           type: array
 *           items:
 *             type: string
 *           description: 서비스 지역
 *           example: ["SEOUL", "GYEONGGI"]
 *         isFavorite:
 *           type: boolean
 *           description: 즐겨찾기 여부 (로그인 시에만)
 *           example: false
 *
 *     MoverDetailExtra:
 *       type: object
 *       properties:
 *         reviews:
 *           type: array
 *           description: 최근 리뷰 목록
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 example: 1
 *               rating:
 *                 type: integer
 *                 example: 5
 *               content:
 *                 type: string
 *                 example: "친절하고 꼼꼼하게 이사해주셨어요!"
 *               createdAt:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-12-19T00:00:00.000Z"
 *         estimates:
 *           type: array
 *           description: 최근 견적 목록
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 example: 1
 *               price:
 *                 type: integer
 *                 example: 300000
 *               movingType:
 *                 type: string
 *                 enum: [SMALL, HOME, OFFICE]
 *                 example: "SMALL"
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
 *                 example: 인증이 필요합니다
 *               code:
 *                 type: string
 *                 example: AUTH_REQUIRED
 *
 *     NotFound:
 *       description: 리소스를 찾을 수 없음
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
 *                 example: 기사님 정보를 찾을 수 없습니다.
 *               code:
 *                 type: string
 *                 example: NOT_FOUND
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
