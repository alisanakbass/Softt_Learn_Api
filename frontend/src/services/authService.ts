import api from "./api";

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    token: string;
    user: {
      id: number;
      email: string;
      name: string;
      role: "USER" | "TEACHER" | "ADMIN";
    };
  };
  message?: string;
}

export const authService = {
  // Kullanıcı girişi
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post("/auth/login", data);
    if (response.data.success && response.data.data?.token) {
      localStorage.setItem("token", response.data.data.token);
    }
    return response.data;
  },

  // Kullanıcı kaydı
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post("/auth/register", data);
    if (response.data.success && response.data.data?.token) {
      localStorage.setItem("token", response.data.data.token);
    }
    return response.data;
  },

  // Çıkış yap
  logout: () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  },

  // Token var mı kontrol et
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem("token");
  },
};
