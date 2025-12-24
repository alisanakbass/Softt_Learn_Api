import { prisma } from "../config/database.js";

export interface CreateQuestionData {
  contentId: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string | undefined;
}

export interface UpdateQuestionData {
  question?: string | undefined;
  options?: string[] | undefined;
  correctAnswer?: number | undefined;
  explanation?: string | undefined;
}

export class QuestionService {
  // Tüm soruları getir (content'e göre)
  async getAll(contentId: number) {
    return await prisma.question.findMany({
      where: { contentId },
      orderBy: { createdAt: "asc" },
    });
  }

  // ID'ye göre soru getir
  async getById(id: number) {
    const question = await prisma.question.findUnique({
      where: { id },
      include: {
        content: {
          include: {
            node: true,
          },
        },
      },
    });

    if (!question) {
      throw new Error("Soru bulunamadı");
    }

    return question;
  }

  // Yeni soru oluştur
  async create(data: CreateQuestionData) {
    // Content'in QUIZ tipinde olduğunu kontrol et
    const content = await prisma.content.findUnique({
      where: { id: data.contentId },
    });

    if (!content) {
      throw new Error("İçerik bulunamadı");
    }

    if (content.type !== "QUIZ") {
      throw new Error("Sorular sadece QUIZ tipindeki içeriklere eklenebilir");
    }

    return await prisma.question.create({
      data: {
        ...data,
        explanation: data.explanation ?? null,
      },
    });
  }

  // Soru güncelle
  async update(id: number, data: UpdateQuestionData) {
    const updateData: any = { ...data };
    if ("explanation" in data)
      updateData.explanation = data.explanation ?? null;

    return await prisma.question.update({
      where: { id },
      data: updateData,
    });
  }

  // Soru sil
  async delete(id: number) {
    return await prisma.question.delete({
      where: { id },
    });
  }

  // Cevabı kontrol et
  async checkAnswer(id: number, userAnswer: number) {
    const question = await this.getById(id);
    const isCorrect = question.correctAnswer === userAnswer;

    return {
      isCorrect,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
    };
  }
}
