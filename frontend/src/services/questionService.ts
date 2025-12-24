import api from "./api";

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

export interface CreateQuestionData {
  contentId: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface CheckAnswerResponse {
  isCorrect: boolean;
  correctAnswer: number;
  explanation?: string;
}

export const questionService = {
  // Tüm soruları getir (content'e göre)
  getAll: async (contentId: number) => {
    const response = await api.get<{ success: boolean; data: Question[] }>(
      "/questions",
      {
        params: { contentId },
      }
    );
    return response.data;
  },

  // ID'ye göre soru getir
  getById: async (id: number) => {
    const response = await api.get<{ success: boolean; data: Question }>(
      `/questions/${id}`
    );
    return response.data;
  },

  // Cevabı kontrol et
  checkAnswer: async (id: number, userAnswer: number) => {
    const response = await api.post<{
      success: boolean;
      data: CheckAnswerResponse;
    }>(`/questions/${id}/check`, { userAnswer });
    return response.data;
  },

  // Yeni soru oluştur
  create: async (data: CreateQuestionData) => {
    const response = await api.post<{ success: boolean; data: Question }>(
      "/questions",
      data
    );
    return response.data;
  },

  // Soru güncelle
  update: async (
    id: number,
    data: Partial<Omit<CreateQuestionData, "contentId">>
  ) => {
    const response = await api.post<{ success: boolean; data: Question }>(
      `/questions/${id}`,
      data
    );
    return response.data;
  },

  // Soru sil
  delete: async (id: number) => {
    const response = await api.delete<{ success: boolean; message: string }>(
      `/questions/${id}`
    );
    return response.data;
  },
};
