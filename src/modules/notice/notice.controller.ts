import { Request, Response } from "express";
import ApiResponse from "../../core/http/ApiResponse";
import ApiError from "../../core/http/ApiError";
import { asyncWrapper } from "../../utils/asyncWrapper";
import noticeService from "./notice.service";
import {
  NoticeListDto,
  NoticeListPayload,
  NoticeReadDto,
  NoticeReadPayload,
  NoticeReadAllDto,
  NoticeReadAllPayload,
} from "../../validators/notice.validation";
import { HTTP_CODE, HTTP_MESSAGE, HTTP_STATUS } from "../../constants/http";

const getUserNotices = asyncWrapper(
  async (req: Request, res: Response) => {
    const validated = res.locals.validated as { query: NoticeListPayload };
    const userId = req.user?.id ?? validated.query.userId;
    if (!userId) {
      throw new ApiError(
        HTTP_STATUS.AUTH_REQUIRED,
        HTTP_MESSAGE.AUTH_REQUIRED,
        HTTP_CODE.AUTH_REQUIRED
      );
    }
    const { ...filters } = validated.query;

    const data = await noticeService.getUserNotices(
      userId,
      filters as NoticeListDto
    );
    return ApiResponse.success(res, data);
  }
);

const getDriverNotices = asyncWrapper(
  async (req: Request, res: Response) => {
    const validated = res.locals.validated as { query: NoticeListPayload };
    const userId = req.user?.id ?? validated.query.userId;
    if (!userId) {
      throw new ApiError(
        HTTP_STATUS.AUTH_REQUIRED,
        HTTP_MESSAGE.AUTH_REQUIRED,
        HTTP_CODE.AUTH_REQUIRED
      );
    }
    const { ...filters } = validated.query;

    const data = await noticeService.getDriverNotices(
      userId,
      filters as NoticeListDto
    );
    return ApiResponse.success(res, data);
  }
);

const markNoticeRead = asyncWrapper(
  async (req: Request, res: Response) => {
    const validated = res.locals.validated as { params: NoticeReadPayload };
    const userId = req.user?.id;
    if (!userId) {
      throw new ApiError(
        HTTP_STATUS.AUTH_REQUIRED,
        HTTP_MESSAGE.AUTH_REQUIRED,
        HTTP_CODE.AUTH_REQUIRED
      );
    }
    const body: NoticeReadDto = { noticeId: validated.params.id };

    const data = await noticeService.markNoticeRead(
      userId,
      body
    );
    return ApiResponse.success(res, data);
  }
);

const markAllNoticesRead = asyncWrapper(
  async (req: Request, res: Response) => {
    const validated = res.locals.validated as { params: NoticeReadAllPayload };
    const userId = req.user?.id ?? validated.params.id;
    if (!userId) {
      throw new ApiError(
        HTTP_STATUS.AUTH_REQUIRED,
        HTTP_MESSAGE.AUTH_REQUIRED,
        HTTP_CODE.AUTH_REQUIRED
      );
    }
    const body: NoticeReadAllDto = { userId };

    const data = await noticeService.markAllNoticesRead(
      userId,
      body
    );
    return ApiResponse.success(res, data);
  }
);

const noticeController = {
  getUserNotices,
  getDriverNotices,
  markNoticeRead,
  markAllNoticesRead,
};

export default noticeController;
