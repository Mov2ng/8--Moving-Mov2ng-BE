import { TaskType, tableName } from "@prisma/client";

export type HistoryItem = {
  id: number;
  tableName: tableName;
  taskType: TaskType;
  data: string;
  createdAt: Date;
  updatedAt: Date;
};

export type HistoryListResult = {
  items: HistoryItem[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};
