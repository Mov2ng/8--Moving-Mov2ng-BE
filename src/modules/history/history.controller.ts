import { Request, Response } from "express";
import ApiResponse from "../../core/http/ApiResponse";
import { asyncWrapper } from "../../utils/asyncWrapper";
import historyService from "./history.service";
import {
  HistoryDetailPayload,
  HistoryListPayload,
} from "../../validators/history.validation";

const getHistoryList = asyncWrapper(
  async (req: Request, res: Response) => {
    const validated = res.locals.validated as { query: HistoryListPayload };
    const data = await historyService.getHistoryList(validated.query);
    return ApiResponse.success(res, data);
  }
);

const getHistoryDetail = asyncWrapper(
  async (req: Request, res: Response) => {
    const validated = res.locals.validated as { params: HistoryDetailPayload };
    const data = await historyService.getHistoryDetail(validated.params);
    return ApiResponse.success(res, data);
  }
);

const historyController = {
  getHistoryList,
  getHistoryDetail,
};

export default historyController;
