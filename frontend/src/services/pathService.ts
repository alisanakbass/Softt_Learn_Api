import api from "./api";

export interface LearningPath {
  id: number;
  title: string;
  description?: string;
  categoryId: number;
  difficulty?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  category?: {
    id: number;
    name: string;
    slug: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreatePathData {
  title: string;
  description?: string;
  categoryId: number;
  difficulty?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
}

export const pathService = {
  // Tüm learning path'leri getir (opsiyonel kategori filtresi)
  getAll: async (
    categoryId?: number,
    difficulty?: string,
    search?: string,
    page: number = 1,
    limit: number = 9
  ) => {
    const params: {
      page: number;
      limit: number;
      categoryId?: number;
      difficulty?: string;
      search?: string;
    } = {
      page,
      limit,
    };
    if (categoryId) params.categoryId = categoryId;
    if (difficulty) params.difficulty = difficulty;
    if (search) params.search = search;

    const response = await api.get<{
      success: boolean;
      data: LearningPath[];
      pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    }>("/path", { params });
    return response.data;
  },

  // ID'ye göre path getir
  getById: async (id: number) => {
    const response = await api.get<{ success: boolean; data: LearningPath }>(
      `/path/${id}`
    );
    return response.data;
  },

  // Yeni path oluştur
  create: async (data: CreatePathData) => {
    const response = await api.post<{ success: boolean; data: LearningPath }>(
      "/path",
      data
    );
    return response.data;
  },

  // Path güncelle
  update: async (id: number, data: Partial<CreatePathData>) => {
    const response = await api.post<{ success: boolean; data: LearningPath }>(
      `/path/${id}`,
      data
    );
    return response.data;
  },

  // Path sil
  delete: async (id: number) => {
    const response = await api.delete<{ success: boolean; message: string }>(
      `/path/${id}`
    );
    return response.data;
  },

  // Path sıralama güncelle
  reorder: async (updates: { id: number; order: number }[]) => {
    const response = await api.put<{ success: boolean; message: string }>(
      "/path/reorder",
      { updates }
    );
    return response.data;
  },
};
