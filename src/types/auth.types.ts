export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface JWTPayload {
  userId: number;
  email: string;
  role: string;
}
