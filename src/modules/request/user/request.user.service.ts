import requestUserRepository, {
  QuoteWithDriver,
} from "./request.user.repository";
import { EstimateStatus } from "../../../generated/prisma";

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

export default {
  getReceivedQuotes,
};
