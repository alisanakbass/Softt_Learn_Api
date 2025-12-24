import api from "./api";

export interface User {
  id: number;
  email: string;
  name: string;
  role: "STUDENT" | "TEACHER" | "ADMIN";
  createdAt: string;
}

export interface UserListResponse {
  success: boolean;
  data: {
    items: User[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export const userService = {
  getAll: async (page = 1, limit = 10) => {
    const response = await api.get<UserListResponse>(`/users`, {
      params: { page, limit },
    });
    return response.data;
  },

  updateRole: async (userId: number, role: string) => {
    const response = await api.patch(`/users/${userId}/role`, { role });
    return response.data;
  },

  create: async (data: Partial<User> & { password?: string }) => {
    const response = await api.post("/users", data);
    return response.data;
  },

  update: async (
    userId: number,
    data: Partial<User> & { password?: string }
  ) => {
    const response = await api.patch(`/users/${userId}`, data);
    return response.data;
  },

  delete: async (userId: number) => {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  },
};
