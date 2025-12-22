import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../config/database.js";
import { config } from "../config/index.js";
import type {
  RegisterInput,
  LoginInput,
  JWTPayload,
} from "../types/auth.types.js";

export class AuthService {
  async register(data: RegisterInput) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existingUser) {
      throw new Error("Bu email kullanilmakta");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
      },
    });
    const { password, ...userWithOutPassword } = user;
    return userWithOutPassword;
  }
  async login(data: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (!user) {
      throw new Error("Email yada password hatali");
    }
    const isPasswordValid = await bcrypt.compare(data.password, user.password);

    if (!isPasswordValid) {
      throw new Error("Email veya password hatali!");
    }

    const Payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const signOptions: jwt.SignOptions = {
      expiresIn: config.jwt.expiresIn as any,
    };

    const token = jwt.sign(Payload, config.jwt.secret, signOptions);

    const { password, ...userWithOutPassword } = user;
    return { user: userWithOutPassword, token };
  }
}
