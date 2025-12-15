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
 *
 * /api/requests/driver/list:
 *   get:
 *     summary: Driver request list
 *     tags:
 *       - Driver
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         required: false
 *         description: Page number (default 1)
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *         required: false
 *         description: Page size (default 10)
 *       - in: query
 *         name: movingType
 *         schema:
 *           type: string
 *         required: false
 *       - in: query
 *         name: region
 *         schema:
 *           type: string
 *         required: false
 *       - in: query
 *         name: isDesignated
 *         schema:
 *           type: boolean
 *         required: false
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [soonest, recent]
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
 * /api/requests/driver/estimate/list:
 *   get:
 *     summary: Driver designated request list
 *     tags:
 *       - Driver
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         required: false
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *         required: false
 *       - in: query
 *         name: movingType
 *         schema:
 *           type: string
 *         required: false
 *       - in: query
 *         name: region
 *         schema:
 *           type: string
 *         required: false
 *       - in: query
 *         name: requestId
 *         schema:
 *           type: integer
 *         required: false
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [soonest, recent]
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
 */
