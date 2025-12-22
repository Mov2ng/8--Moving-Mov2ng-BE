import requestUserRepository, {
  type QuoteWithDriver,
} from "./request.user.repository";
import { EstimateStatus } from "@prisma/client";

async function getReceivedQuotes(
  userId: string,
  requestId?: number,
  status?: EstimateStatus
): Promise<QuoteWithDriver[]> {
  return requestUserRepository.findReceivedQuotes({
    userId,
    requestId,
    status,
  });
}

async function getPendingQuoteDetail(
  userId: string,
  estimateId: number
): Promise<QuoteWithDriver | null> {
  return requestUserRepository.findPendingQuoteDetail({
    userId,
    estimateId,
  });
}

async function acceptQuote(userId: string, estimateId: number) {
  return requestUserRepository.acceptQuote({ userId, estimateId });
}

export default {
  getReceivedQuotes,
  getPendingQuoteDetail,
  acceptQuote,
};
