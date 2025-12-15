import { Request, Response } from "express";
import ApiError from "../../../core/http/ApiError";
import ApiResponse from "../../../core/http/ApiResponse";
import { HTTP_CODE, HTTP_MESSAGE, HTTP_STATUS } from "../../../constants/http";
import asyncWrapper from "../../../utils/asyncWrapper";
import driverRequestService from "./request.driver.service";
import { toDriverRequestListResponseDto } from "./request.driver.dto";
import {
  DriverDesignatedListQuery,
  DriverRequestListQuery,
} from "./request.driver.validation";

const getDriverRequests = asyncWrapper(
  async (req: Request & { user?: { id: string } }, res: Response) => {
    const validated = res.locals.validated as { query: DriverRequestListQuery };

    const userId = req.user?.id;
    if (!userId) {
      throw new ApiError(
        HTTP_STATUS.AUTH_REQUIRED,
        HTTP_MESSAGE.AUTH_REQUIRED,
        HTTP_CODE.AUTH_REQUIRED
      );
    }

    const data = await driverRequestService.getDriverRequestList(
      userId,
      validated.query
    );
    const response = toDriverRequestListResponseDto(data);
    return ApiResponse.success(res, response);
  }
);

const getDriverDesignatedRequests = asyncWrapper(
  async (req: Request & { user?: { id: string } }, res: Response) => {
    const validated = res.locals.validated as {
      query: DriverDesignatedListQuery;
    };

    const userId = req.user?.id;
    if (!userId) {
      throw new ApiError(
        HTTP_STATUS.AUTH_REQUIRED,
        HTTP_MESSAGE.AUTH_REQUIRED,
        HTTP_CODE.AUTH_REQUIRED
      );
    }

    const data = await driverRequestService.getDriverDesignatedRequestList(
      userId,
      validated.query
    );
    const response = toDriverRequestListResponseDto(data);
    return ApiResponse.success(res, response);
  }
);

const driverRequestController = {
  getDriverRequests,
  getDriverDesignatedRequests,
};

export default driverRequestController;
