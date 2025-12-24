import api from "./api";
import type { Content } from "./contentService";

export interface Node {
  id: number;
  title: string;
  description?: string;
  order: number;
  pathId: number;
  parentId?: number;
  contentId?: number;
  content?: Content;
  children?: Node[];
  parent?: Node;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNodeData {
  title: string;
  description?: string;
  order: number;
  pathId: number;
  parentId?: number;
  contentId?: number;
}

export const nodeService = {
  // Tüm node'ları getir (path'e göre)
  getAll: async (pathId: number) => {
    const response = await api.get<{ success: boolean; data: Node[] }>(
      "/nodes",
      {
        params: { pathId },
      }
    );
    return response.data;
  },

  // Ağaç yapısını getir
  getTree: async (pathId: number) => {
    const response = await api.get<{ success: boolean; data: Node[] }>(
      "/nodes/tree",
      {
        params: { pathId },
      }
    );
    return response.data;
  },

  // ID'ye göre node getir
  getById: async (id: number) => {
    const response = await api.get<{ success: boolean; data: Node }>(
      `/nodes/${id}`
    );
    return response.data;
  },

  // Yeni node oluştur
  create: async (data: CreateNodeData) => {
    const response = await api.post<{ success: boolean; data: Node }>(
      "/nodes",
      data
    );
    return response.data;
  },

  // Node güncelle
  update: async (id: number, data: Partial<CreateNodeData>) => {
    const response = await api.put<{ success: boolean; data: Node }>(
      `/nodes/${id}`,
      data
    );
    return response.data;
  },

  // Node'ları yeniden sırala
  reorder: async (updates: { id: number; order: number }[]) => {
    const response = await api.post<{ success: boolean; message: string }>(
      "/nodes/reorder",
      { updates }
    );
    return response.data;
  },

  // Node sil
  delete: async (id: number) => {
    const response = await api.delete<{ success: boolean; message: string }>(
      `/nodes/${id}`
    );
    return response.data;
  },
};
