import api from "./api";
import type { LearningPath } from "./pathService";

export interface UserProgress {
  id: number;
  userId: number;
  pathId: number;
  completedNodes: number[];
  currentNodeId?: number;
  startedAt: string;
  lastAccessedAt: string;
  completedAt?: string;
  path?: LearningPath;
  totalNodes?: number;
  completedNodesCount?: number;
  progressPercentage?: number;
}

export interface UserStats {
  totalPaths: number;
  completedPaths: number;
  inProgressPaths: number;
  totalNodes: number;
  completedNodes: number;
  overallProgress: number;
}

export const progressService = {
  // Kullanıcının tüm ilerlemelerini getir
  getUserProgress: async () => {
    const response = await api.get<{ success: boolean; data: UserProgress[] }>(
      "/progress"
    );
    return response.data;
  },

  // Kullanıcı istatistikleri
  getUserStats: async () => {
    const response = await api.get<{ success: boolean; data: UserStats }>(
      "/progress/stats"
    );
    return response.data;
  },

  // Belirli bir path için ilerleme
  getPathProgress: async (pathId: number) => {
    const response = await api.get<{ success: boolean; data: UserProgress }>(
      `/progress/${pathId}`
    );
    return response.data;
  },

  // İlerleme başlat
  startProgress: async (pathId: number) => {
    const response = await api.post<{ success: boolean; data: UserProgress }>(
      "/progress/start",
      {
        pathId,
      }
    );
    return response.data;
  },

  // Node tamamla
  completeNode: async (pathId: number, nodeId: number) => {
    const response = await api.post<{ success: boolean; data: UserProgress }>(
      `/progress/${pathId}/complete`,
      { nodeId }
    );
    return response.data;
  },

  // İlerlemeyi sıfırla
  resetProgress: async (pathId: number) => {
    const response = await api.post<{ success: boolean; data: UserProgress }>(
      `/progress/${pathId}/reset`
    );
    return response.data;
  },
};
