/**
 * @openapi
 * /review:
 *   get:
 *     summary: 리뷰 목록 조회
 *     tags:
 *       - Review
 *     parameters:
 *       - in: query
 *         name: driverId
 *         schema:
 *           type: integer
 *         description: 특정 드라이버에 대한 리뷰만 조회
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: 특정 사용자(작성자) 리뷰만 조회
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
 *                   type: object
 *                   example: []
 *
 * /review/writable:
 *   get:
 *     summary: 작성 가능한 리뷰 조회 (이사 완료 + 내가 확정한 견적, 미작성만)
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
 *                   type: object
 *                   example: []
 */
