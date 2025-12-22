import { prisma } from "../config/database.js";
import type { CategoryCreate } from "../types/category.types.js";

export class CategoryServices {
  async getAll() {
    return await prisma.category.findMany({
      include: {
        path: true,
      },
    });
  }

  async getById(id: number) {
    return await prisma.category.findUnique({
      where: { id: id },
      include: {
        path: true,
      },
    });
  }

  async create(data: CategoryCreate) {
    return await prisma.category.create({ data });
  }
}
