import { prisma } from "../config/database.js";
import { type pathCreate, type pathUpdate } from "../types/path.type.js";

export class PathServices {
  async getAll(
    categoryId?: number,
    difficulty?: string,
    search?: string,
    page: number = 1,
    limit: number = 10
  ) {
    const skip = (page - 1) * limit;

    const where: any = {
      ...(categoryId !== undefined && categoryId !== 0 && { categoryId }),
      ...(difficulty && { difficulty }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const [data, total] = await prisma.$transaction([
      prisma.learningPath.findMany({
        where,
        include: {
          category: true,
          _count: {
            select: { nodes: true },
          },
        },
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
        skip,
        take: limit,
      }),
      prisma.learningPath.count({ where }),
    ]);

    return {
      items: data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getById(id: number) {
    return await prisma.learningPath.findUnique({
      where: { id: id },
    });
  }

  async create(data: pathCreate) {
    // Yeni ekleneni en sona eklemek için max order bul
    const maxOrder = await prisma.learningPath.aggregate({
      _max: { order: true },
    });
    const nextOrder = (maxOrder._max?.order ?? 0) + 1;

    return await prisma.learningPath.create({
      data: {
        title: data.title,
        description: data.description ?? null,
        categoryId: data.categoryId,
        difficulty: data.difficulty ?? null,
        order: nextOrder,
      },
      include: {
        category: true,
      },
    });
  }

  async update(id: number, data: pathUpdate) {
    return await prisma.learningPath.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
        ...(data.categoryId && { categoryId: data.categoryId }),
        ...(data.difficulty && { difficulty: data.difficulty }),
      },
      include: { category: true },
    });
  }

  async reorder(updates: { id: number; order: number }[]) {
    return await prisma.$transaction(
      updates.map(({ id, order }) =>
        prisma.learningPath.update({
          where: { id },
          data: { order },
        })
      )
    );
  }

  async delete(id: number) {
    return await prisma.learningPath.delete({
      where: { id },
    });
  }
}
