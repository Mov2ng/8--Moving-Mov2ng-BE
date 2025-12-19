import estimateRepository from "./estimate.repository";

import type { PostEstimateDTO } from "./estimate.dto";

async function postEstimate(estimate: PostEstimateDTO, userId: string) {
  const newEstimate = await estimateRepository.postEstimate(estimate, userId);
  return newEstimate;
}

export default {
  postEstimate,
};