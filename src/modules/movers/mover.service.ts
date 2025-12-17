import moverRepository from "./mover.repository";

async function getMovers() {
  return moverRepository.getMovers();
}

async function searchMoversByNickname(nickname: string) {
  return moverRepository.searchMoversByNickname(nickname);
}

async function getMoverById(id: string) {
  return moverRepository.getMoverById(id);
}

export default {
  getMovers,
  searchMoversByNickname,
  getMoverById,
};