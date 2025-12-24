import api from "./api";

export type ContentType = "VIDEO" | "ARTICLE" | "QUIZ" | "EXERCISE";

export interface Content {
  id: number;
  type: ContentType;
  title: string;
  description?: string;
  videoUrl?: string;
  duration?: number;
  articleText?: string;
  questions?: Question[];
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  id: number;
  contentId: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContentData {
  type: ContentType;
  title: string;
  description?: string;
  videoUrl?: string;
  duration?: number;
  articleText?: string;
  questions?: Array<{
    question: string;
    options: string[];
    correctAnswer: number;
    explanation?: string;
  }>;
}

export const contentService = {
  // Tüm içerikleri getir
  getAll: async (type?: ContentType) => {
    const response = await api.get<{ success: boolean; data: Content[] }>(
      "/content",
      {
        params: type ? { type } : {},
      }
    );
    return response.data;
  },

  // ID'ye göre içerik getir
  getById: async (id: number) => {
    const response = await api.get<{ success: boolean; data: Content }>(
      `/content/${id}`
    );
    return response.data;
  },

  // Yeni içerik oluştur
  create: async (data: CreateContentData) => {
    const response = await api.post<{ success: boolean; data: Content }>(
      "/content",
      data
    );
    return response.data;
  },

  // İçerik güncelle
  update: async (id: number, data: Partial<CreateContentData>) => {
    const response = await api.post<{ success: boolean; data: Content }>(
      `/content/${id}`,
      data
    );
    return response.data;
  },

  // İçerik sil
  delete: async (id: number) => {
    const response = await api.delete<{ success: boolean; message: string }>(
      `/content/${id}`
    );
    return response.data;
  },
};
