import api from "./api";

export interface Category {
  id: number;
  name: string;
  description?: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export const categoryService = {
  // Tüm kategorileri getir
  getAll: async () => {
    const response = await api.get<{ success: boolean; data: Category[] }>(
      "/categories"
    );
    return response.data;
  },

  // ID'ye göre kategori getir
  getById: async (id: number) => {
    const response = await api.get<{ success: boolean; data: Category }>(
      `/categories/${id}`
    );
    return response.data;
  },

  // Yeni kategori oluştur (Admin)
  create: async (data: {
    name: string;
    description?: string;
    slug: string;
  }) => {
    const response = await api.post<{ success: boolean; data: Category }>(
      "/categories",
      data
    );
    return response.data;
  },
};
