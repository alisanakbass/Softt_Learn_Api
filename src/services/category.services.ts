import { prisma } from "../config/database.js";
import type {
  CategoryCreate,
  CategoryUpdate,
} from "../types/category.types.js";

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

  async update(id: number, data: CategoryUpdate) {
    return await prisma.category.update({
      where: { id },
      data,
    });
  }

  async delete(id: number) {
    return await prisma.category.delete({ where: { id } });
  }
}
