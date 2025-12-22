import estimateRepository from "./estimate.repository";

import type { PostEstimateDTO } from "./estimate.dto";
import ApiError from "../../core/http/ApiError";
import { HTTP_CODE, HTTP_MESSAGE, HTTP_STATUS } from "../../constants/http";

async function postEstimate(estimate: PostEstimateDTO, userId: string) {
  const newEstimate = await estimateRepository.postEstimate(estimate, userId);
  return newEstimate;
}

async function requestEstimate(driverId: number, userId: string) {
  const request = await estimateRepository.getActiveEstimate(userId);

  if (!request) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, HTTP_MESSAGE.ESTIMATE_NOT_FOUND, HTTP_CODE.ESTIMATE_NOT_FOUND);
  }

  const estimate = await estimateRepository.postRequestEstimate(driverId, request.id);
  return estimate;
}

export default {
  postEstimate,
  requestEstimate,
};