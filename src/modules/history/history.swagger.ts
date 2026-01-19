/**
 * @openapi
 * components:
 *   schemas:
 *     HistoryItem:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 101
 *         tableName:
 *           type: string
 *           example: Request
 *         taskType:
 *           type: string
 *           enum: [CREATE, UPDATE, DELETE]
 *           example: UPDATE
 *         data:
 *           type: string
 *           example: "{\"id\":1,\"origin\":\"seoul\"}"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     HistoryListResponse:
 *       type: object
 *       properties:
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/HistoryItem'
 *         page:
 *           type: integer
 *         pageSize:
 *           type: integer
 *         totalItems:
 *           type: integer
 *         totalPages:
 *           type: integer
 *
 * /history:
 *   get:
 *     summary: History 전체 조회
 *     tags:
 *       - History
 *     parameters:
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
 *     responses:
 *       200:
 *         description: History 목록
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HistoryListResponse'
 *       401:
 *         description: Unauthorized
 *
 * /history/{id}:
 *   get:
 *     summary: History 단일 조회
 *     tags:
 *       - History
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: History 단일 항목
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HistoryItem'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not Found
 */
