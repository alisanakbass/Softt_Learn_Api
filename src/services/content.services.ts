import { prisma } from "../config/database.js";

export type ContentType = "VIDEO" | "ARTICLE" | "QUIZ" | "EXERCISE";

export interface CreateContentData {
  type: ContentType;
  title: string;
  description?: string | undefined;
  videoUrl?: string | undefined;
  duration?: number | undefined;
  articleText?: string | undefined;
}

export interface UpdateContentData {
  type?: ContentType | undefined;
  title?: string | undefined;
  description?: string | undefined;
  videoUrl?: string | undefined;
  duration?: number | undefined;
  articleText?: string | undefined;
  questions?: Array<{
    question: string;
    options: string[];
    correctAnswer: number;
    explanation?: string;
  }>;
}

export class ContentService {
  // Tüm içerikleri getir
  async getAll() {
    return await prisma.content.findMany({
      include: {
        questions: true,
        node: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  // ID'ye göre içerik getir
  async getById(id: number) {
    const content = await prisma.content.findUnique({
      where: { id },
      include: {
        questions: true,
        node: {
          include: {
            path: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    if (!content) {
      throw new Error("İçerik bulunamadı");
    }

    return content;
  }

  // Yeni içerik oluştur
  async create(data: CreateContentData) {
    return await prisma.content.create({
      data: {
        ...data,
        description: data.description ?? null,
        videoUrl: data.videoUrl ?? null,
        duration: data.duration ?? null,
        articleText: data.articleText ?? null,
      },
      include: {
        questions: true,
        node: true,
      },
    });
  }

  // İçerik güncelle
  async update(id: number, data: UpdateContentData) {
    const updateData: any = { ...data };
    if ("description" in data)
      updateData.description = data.description ?? null;
    if ("videoUrl" in data) updateData.videoUrl = data.videoUrl ?? null;
    if ("duration" in data) updateData.duration = data.duration ?? null;
    if ("articleText" in data)
      updateData.articleText = data.articleText ?? null;

    // Eğer soru ekleme/güncelleme varsa
    if (data.questions && Array.isArray(data.questions)) {
      // Mevcut soruları sil (basitlik için önce silip sonra ekliyoruz, production'da update yapılabilir)
      await prisma.question.deleteMany({
        where: { contentId: id },
      });

      const questionsData = data.questions.map((q) => ({
        ...q,
        contentId: id,
      }));

      await prisma.question.createMany({
        data: questionsData,
      });
    }

    // Soruları data'dan çıkar (prisma.content.update'e gitmemesi için)
    delete updateData.questions;

    return await prisma.content.update({
      where: { id },
      data: updateData,
      include: {
        questions: true,
        node: true,
      },
    });
  }

  // İçerik sil
  async delete(id: number) {
    return await prisma.content.delete({
      where: { id },
    });
  }

  // Type'a göre içerikleri getir
  async getByType(type: ContentType) {
    return await prisma.content.findMany({
      where: { type },
      include: {
        questions: type === "QUIZ",
        node: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }
}
