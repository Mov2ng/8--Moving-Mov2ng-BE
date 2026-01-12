/**
 * @openapi
 * components:
 *   schemas:
 *     DriverRequestListItem:
 *       type: object
 *       properties:
 *         requestId:
 *           type: integer
 *           example: 123
 *         movingType:
 *           type: string
 *           example: "HOUSE"
 *         movingDate:
 *           type: string
 *           format: date-time
 *           example: "2024-12-31T10:00:00Z"
 *         origin:
 *           type: string
 *           example: "Seoul Gangnam-gu ..."
 *         destination:
 *           type: string
 *           example: "Seoul Songpa-gu ..."
 *         isDesignated:
 *           type: boolean
 *           example: false
 *         estimateId:
 *           type: integer
 *           nullable: true
 *           example: 456
 *         estimateStatus:
 *           type: string
 *           nullable: true
 *           example: "PENDING"
 *         estimatePrice:
 *           type: integer
 *           nullable: true
 *           example: 120000
 *         userId:
 *           type: string
 *           nullable: true
 *         requestCreatedAt:
 *           type: string
 *           format: date-time
 *         requestUpdatedAt:
 *           type: string
 *           format: date-time
 *     DriverRequestListResponse:
 *       type: object
 *       properties:
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/DriverRequestListItem'
 *         designatedCount:
 *           type: integer
 *           example: 2
 *         page:
 *           type: integer
 *           example: 1
 *         pageSize:
 *           type: integer
 *           example: 10
 *         totalItems:
 *           type: integer
 *           example: 23
 *         totalPages:
 *           type: integer
 *           example: 3
 *     DriverRejectedEstimateListItem:
 *       type: object
 *       properties:
 *         estimateId:
 *           type: integer
 *         requestId:
 *           type: integer
 *         driverId:
 *           type: integer
 *         status:
 *           type: string
 *           enum: [PENDING, ACCEPTED, REJECTED]
 *         requestReason:
 *           type: string
 *           nullable: true
 *         isRequest:
 *           type: boolean
 *         price:
 *           type: integer
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         request:
 *           type: object
 *           nullable: true
 *           properties:
 *             movingType:
 *               type: string
 *             movingDate:
 *               type: string
 *               format: date-time
 *             origin:
 *               type: string
 *             destination:
 *               type: string
 *     DriverRejectedEstimateListResponse:
 *       type: object
 *       properties:
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/DriverRejectedEstimateListItem'
 *         page:
 *           type: integer
 *         pageSize:
 *           type: integer
 *         totalItems:
 *           type: integer
 *         totalPages:
 *           type: integer
 *     DriverEstimateActionResponse:
 *       type: object
 *       properties:
 *         estimateId:
 *           type: integer
 *         requestId:
 *           type: integer
 *         driverId:
 *           type: integer
 *         status:
 *           type: string
 *           enum: [PENDING, ACCEPTED, REJECTED]
 *         requestReason:
 *           type: string
 *         isRequest:
 *           type: boolean
 *         price:
 *           type: integer
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     DriverRequestDeleteResponse:
 *       type: object
 *       properties:
 *         requestId:
 *           type: integer
 *         deletedEstimates:
 *           type: integer
 *
 * /requests/driver/list:
 *   get:
 *     summary: 드라이버 견적 요청 리스트
 *     operationId: list
 *     tags:
 *       - Driver
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *           example: "11111111-1111-1111-1111-111111111111"
 *         required: true
 *         description: 시딩(driver.seed)으로 생성한 드라이버 userId
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *           example: 1
 *         required: false
 *         description: Page number (default 1)
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *           example: 10
 *         required: false
 *         description: Page size (default 10)
 *       - in: query
 *         name: requestId
 *         schema:
 *           type: integer
 *         required: false
 *         description: "요청 ID (시딩(driver.seed) 기본값: 900001)"
 *       - in: query
 *         name: movingType
 *         schema:
 *           type: string
 *           default: SMALL
 *           example: SMALL
 *         required: false
 *       - in: query
 *         name: region
 *         schema:
 *           type: string
 *           default: SEOUL
 *           example: SEOUL
 *         required: false
 *       - in: query
 *         name: isDesignated
 *         schema:
 *           type: boolean
 *           default: false
 *           example: false
 *         required: false
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [soonest, recent]
 *           default: soonest
 *           example: soonest
 *     responses:
 *       200:
 *         description: Driver request list
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DriverRequestListResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       400:
 *         description: Bad request
 *
 * /requests/driver/estimate/rejected:
 *   get:
 *     summary: 반려된 견적 리스트 (드라이버 본인)
 *     operationId: rejected
 *     tags:
 *       - Driver
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *           example: "11111111-1111-1111-1111-111111111111"
 *         required: true
 *         description: 시딩(driver.seed)으로 생성한 드라이버 userId
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *           example: 1
 *         required: false
 *         description: Page number (default 1)
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *           example: 10
 *         required: false
 *         description: Page size (default 10)
 *     responses:
 *       200:
 *         description: Rejected estimates
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DriverRejectedEstimateListResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       400:
 *         description: Bad request
 *
 * /requests/driver/estimate/list:
 *   get:
 *     summary: 드라이버 지정 견적 요청 리스트
 *     operationId: list
 *     tags:
 *       - Driver
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *           example: "11111111-1111-1111-1111-111111111111"
 *         required: true
 *         description: 시딩(driver.seed)으로 생성한 드라이버 userId
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *           example: 1
 *         required: false
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *           example: 10
 *         required: false
 *       - in: query
 *         name: movingType
 *         schema:
 *           type: string
 *           default: SMALL
 *           example: SMALL
 *         required: false
 *       - in: query
 *         name: region
 *         schema:
 *           type: string
 *           default: SEOUL
 *           example: SEOUL
 *         required: false
 *       - in: query
 *         name: requestId
 *         schema:
 *           type: integer
 *           example: 900001
 *         required: false
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [soonest, recent]
 *           default: soonest
 *           example: soonest
 *         required: false
 *     responses:
 *       200:
 *         description: Driver designated request list
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DriverRequestListResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       400:
 *         description: Bad request
 *
 * /requests/driver/estimate/accept:
 *   post:
 *     summary: 드라이버 견적 승인(수락) 생성
 *     operationId: accept
 *     tags:
 *       - Driver
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example:
 *               userId: "11111111-1111-1111-1111-111111111111"
 *               requestId: 900001
 *               requestReason: "승인합니다"
 *               price: 120000
 *             properties:
 *               userId:
 *                 type: string
 *               requestId:
 *                 type: integer
 *               requestReason:
 *                 type: string
 *               price:
 *                 type: integer
 *             required:
 *               - userId
 *               - requestId
 *               - requestReason
 *               - price
 *     responses:
 *       200:
 *         description: 생성된 견적 정보
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DriverEstimateActionResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       400:
 *         description: Bad request
 *
 * /requests/driver/estimate/reject:
 *   post:
 *     summary: 드라이버 견적 반려 생성
 *     operationId: reject
 *     tags:
 *       - Driver
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example:
 *               userId: "11111111-1111-1111-1111-111111111111"
 *               requestId: 900001
 *               requestReason: "반려합니다"
 *             properties:
 *               userId:
 *                 type: string
 *               requestId:
 *                 type: integer
 *               requestReason:
 *                 type: string
 *             required:
 *               - userId
 *               - requestId
 *               - requestReason
 *     responses:
 *       200:
 *         description: 생성된 견적 정보
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DriverEstimateActionResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       400:
 *         description: Bad request
 *
 * /requests/driver/estimate/update:
 *   post:
 *     summary: Driver estimate decision update
 *     operationId: updateEstimateDecision
 *     tags:
 *       - Driver
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - type: object
 *                 example:
 *                   userId: "11111111-1111-1111-1111-111111111111"
 *                   requestId: 900001
 *                   status: "ACCEPTED"
 *                   requestReason: "Approved"
 *                   price: 120000
 *                 properties:
 *                   userId:
 *                     type: string
 *                   requestId:
 *                     type: integer
 *                   status:
 *                     type: string
 *                     enum: [ACCEPTED]
 *                   requestReason:
 *                     type: string
 *                   price:
 *                     type: integer
 *                 required:
 *                   - userId
 *                   - requestId
 *                   - status
 *                   - requestReason
 *                   - price
 *               - type: object
 *                 example:
 *                   userId: "11111111-1111-1111-1111-111111111111"
 *                   requestId: 900001
 *                   status: "REJECTED"
 *                   requestReason: "Rejected"
 *                 properties:
 *                   userId:
 *                     type: string
 *                   requestId:
 *                     type: integer
 *                   status:
 *                     type: string
 *                     enum: [REJECTED]
 *                   requestReason:
 *                     type: string
 *                 required:
 *                   - userId
 *                   - requestId
 *                   - status
 *                   - requestReason
 *     responses:
 *       200:
 *         description: Created estimate info
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DriverEstimateActionResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       400:
 *         description: Bad request
 *
 * /requests/driver/request:
 *   delete:
 *     summary: Driver request delete
 *     operationId: deleteDriverRequest
 *     tags:
 *       - Driver
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example:
 *               userId: "11111111-1111-1111-1111-111111111111"
 *               requestId: 900001
 *             properties:
 *               userId:
 *                 type: string
 *               requestId:
 *                 type: integer
 *             required:
 *               - userId
 *               - requestId
 *     responses:
 *       200:
 *         description: Request delete success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DriverRequestDeleteResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       400:
 *         description: Bad request
 */
