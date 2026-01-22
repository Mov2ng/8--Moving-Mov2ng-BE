/**
 * @swagger
 * tags:
 *   - name: Upload
 *     description: 파일 업로드 관련 API
 */

/**
 * @swagger
 * /upload/presigned-url:
 *   post:
 *     summary: 업로드용 presigned URL 생성
 *     tags: [Upload]
 *     description: S3에 파일을 업로드하기 위한 presigned URL을 생성합니다. 생성된 URL로 직접 S3에 파일을 업로드할 수 있습니다.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fileName
 *             properties:
 *               fileName:
 *                 type: string
 *                 description: 파일 이름
 *                 example: "profile.jpg"
 *               category:
 *                 type: string
 *                 enum: [PROFILE, SAMPLE]
 *                 description: "파일 카테고리 (선택, 기본값: PROFILE)"
 *                 default: "PROFILE"
 *                 example: PROFILE
 *               contentType:
 *                 type: string
 *                 description: "파일 MIME 타입 (선택, 기본값: image/jpeg)"
 *                 default: "image/jpeg"
 *                 example: image/jpeg
 *     responses:
 *       200:
 *         description: presigned URL 생성 성공
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
 *                   description: 성공 메시지
 *                   example: 파일 업로드 presigned url 생성 성공
 *                 data:
 *                   type: object
 *                   properties:
 *                     presignedUrl:
 *                       type: string
 *                       description: S3 업로드용 presigned URL
 *                       example: "https://s3.amazonaws.com/bucket/file-key?X-Amz-Algorithm=..."
 *                     fileKey:
 *                       type: string
 *                       description: S3에 저장될 파일 키
 *                       example: "USER/uuid-string/PROFILE/profile.jpg"
 *       400:
 *         description: 잘못된 요청 (파일명 누락 또는 유효하지 않은 카테고리)
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
 *                   example: 파일명은 필수입니다.
 *                 code:
 *                   type: string
 *                   example: BAD_REQUEST
 *       401:
 *         description: 인증 필요
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
 *   get:
 *     summary: 조회용 presigned URL 생성
 *     tags: [Upload]
 *     description: S3에 저장된 파일을 조회하기 위한 presigned URL을 생성합니다. 매번 새로 생성되며 만료 시간은 1시간입니다.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: fileKey
 *         required: true
 *         schema:
 *           type: string
 *         description: S3에 저장된 파일 키
 *         example: "USER/uuid-string/PROFILE/profile.jpg"
 *     responses:
 *       200:
 *         description: presigned URL 생성 성공
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
 *                   description: 성공 메시지
 *                   example: 파일 조회용 presigned url 생성 성공
 *                 data:
 *                   type: object
 *                   properties:
 *                     presignedUrl:
 *                       type: string
 *                       description: S3 조회용 presigned URL (만료 시간 1시간)
 *                       example: "https://s3.amazonaws.com/bucket/file-key?X-Amz-Algorithm=..."
 *       400:
 *         description: 잘못된 요청 (fileKey 누락)
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
 *                   example: 파일 조회 실패
 *                 code:
 *                   type: string
 *                   example: BAD_REQUEST
 *       401:
 *         description: 인증 필요
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
 *   delete:
 *     summary: 삭제용 presigned URL 생성
 *     tags: [Upload]
 *     description: S3에 저장된 파일을 삭제하기 위한 presigned URL을 생성합니다. 생성된 URL로 직접 S3에서 파일을 삭제할 수 있습니다. 만료 시간은 1시간입니다.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: fileKey
 *         required: true
 *         schema:
 *           type: string
 *         description: S3에 저장된 파일 키
 *         example: "USER/uuid-string/PROFILE/profile.jpg"
 *     responses:
 *       200:
 *         description: presigned URL 생성 성공
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
 *                   description: 성공 메시지
 *                   example: 파일 삭제용 presigned url 생성 성공
 *                 data:
 *                   type: object
 *                   properties:
 *                     presignedUrl:
 *                       type: string
 *                       description: S3 삭제용 presigned URL (만료 시간 1시간)
 *                       example: "https://s3.amazonaws.com/bucket/file-key?X-Amz-Algorithm=..."
 *       400:
 *         description: 잘못된 요청 (fileKey 누락)
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
 *                   example: 파일 삭제 실패
 *                 code:
 *                   type: string
 *                   example: BAD_REQUEST
 *       401:
 *         description: 인증 필요
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

// 트리쉐이킹 방지: 빌드 시 이 파일이 포함되도록 export 추가
export {};
