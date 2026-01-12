import { Request, Response } from "express";
import ApiError from "../../../core/http/ApiError";
import ApiResponse from "../../../core/http/ApiResponse";
import { HTTP_CODE, HTTP_MESSAGE, HTTP_STATUS } from "../../../constants/http";
import { asyncWrapper } from "../../../utils/asyncWrapper";
import driverRequestService from "./request.driver.service";
import { toDriverRequestListResponseDto } from "./request.driver.dto";
import {
  DriverDesignatedListDto,
  DriverDesignatedListPayload,
  DriverEstimateAcceptDto,
  DriverEstimateAcceptPayload,
  DriverEstimateRejectDto,
  DriverEstimateRejectPayload,
  DriverEstimateUpdateDto,
  DriverEstimateUpdatePayload,
  DriverRequestDeleteDto,
  DriverRequestDeletePayload,
  DriverRequestListDto,
  DriverRequestListPayload,
  DriverRejectedEstimateListDto,
  DriverRejectedEstimateListPayload,
} from "../../../validators/request.driver.validation";

const getDriverRequests = asyncWrapper(
  async (
    req: Request<{}, {}, DriverRequestListPayload>,
    res: Response
  ) => {
    const validated = res.locals.validated as { query: DriverRequestListPayload };
    const { userId, ...filters } = validated.query;

    const data = await driverRequestService.getDriverRequestList(
      userId,
      filters as DriverRequestListDto
    );
    const response = toDriverRequestListResponseDto(data);
    return ApiResponse.success(res, response);
  }
);

const getDriverDesignatedRequests = asyncWrapper(
  async (
    req: Request<{}, {}, DriverDesignatedListPayload>,
    res: Response
  ) => {
    const validated = res.locals.validated as { query: DriverDesignatedListPayload };
    const { userId, ...filters } = validated.query;

    const data = await driverRequestService.getDriverDesignatedRequestList(
      userId,
      filters as DriverDesignatedListDto
    );
    const response = toDriverRequestListResponseDto(data);
    return ApiResponse.success(res, response);
  }
);

const acceptEstimate = asyncWrapper(
  async (
    req: Request<{}, {}, DriverEstimateAcceptPayload>,
    res: Response
  ) => {
    const validated = res.locals.validated as { body: DriverEstimateAcceptPayload };
    const { userId, ...body } = validated.body;

    const data = await driverRequestService.createEstimateAndApprove(
      userId,
      body as DriverEstimateAcceptDto
    );
    return ApiResponse.success(res, data);
  }
);

const rejectEstimate = asyncWrapper(
  async (
    req: Request<{}, {}, DriverEstimateRejectPayload>,
    res: Response
  ) => {
    const validated = res.locals.validated as { body: DriverEstimateRejectPayload };
    const { userId, ...body } = validated.body;

    const data = await driverRequestService.createEstimateAndReject(
      userId,
      body as DriverEstimateRejectDto
    );
    return ApiResponse.success(res, data);
  }
);

const updateEstimateDecision = asyncWrapper(
  async (
    req: Request<{}, {}, DriverEstimateUpdatePayload>,
    res: Response
  ) => {
    const validated = res.locals.validated as { body: DriverEstimateUpdatePayload };
    const { userId, ...body } = validated.body;

    const data = await driverRequestService.updateEstimateDecision(
      userId,
      body as DriverEstimateUpdateDto
    );
    return ApiResponse.success(res, data);
  }
);

const deleteDriverRequest = asyncWrapper(
  async (
    req: Request<{}, {}, DriverRequestDeletePayload>,
    res: Response
  ) => {
    const validated = res.locals.validated as { body: DriverRequestDeletePayload };
    const { userId, ...body } = validated.body;

    const data = await driverRequestService.deleteDriverRequest(
      userId,
      body as DriverRequestDeleteDto
    );
    return ApiResponse.success(res, data);
  }
);

const getRejectedEstimates = asyncWrapper(
  async (
    req: Request<{}, {}, DriverRejectedEstimateListPayload>,
    res: Response
  ) => {
    const validated = res.locals.validated as {
      query: DriverRejectedEstimateListPayload;
    };
    const { userId, ...filters } = validated.query;

    const data = await driverRequestService.getDriverRejectedEstimates(
      userId,
      filters as DriverRejectedEstimateListDto
    );
    return ApiResponse.success(res, data);
  }
);

const driverRequestController = {
  getDriverRequests,
  getDriverDesignatedRequests,
  acceptEstimate,
  rejectEstimate,
  updateEstimateDecision,
  getRejectedEstimates,
  deleteDriverRequest,
};

export default driverRequestController;
