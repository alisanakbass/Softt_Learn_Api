import { prisma } from "../config/database.js";

export interface StartProgressData {
  userId: number;
  pathId: number;
}

export interface UpdateProgressData {
  completedNodes?: number[];
  currentNodeId?: number;
}

export class ProgressService {
  // Kullanıcının tüm ilerlemelerini getir
  async getUserProgress(userId: number) {
    return await prisma.userProgress.findMany({
      where: { userId },
      include: {
        path: {
          include: {
            category: true,
            nodes: true,
          },
        },
      },
      orderBy: { lastAccessedAt: "desc" },
    });
  }

  // Belirli bir path için ilerlemeyi getir
  async getPathProgress(userId: number, pathId: number) {
    const progress = await prisma.userProgress.findUnique({
      where: {
        userId_pathId: {
          userId,
          pathId,
        },
      },
      include: {
        path: {
          include: {
            category: true,
            nodes: {
              include: {
                content: true,
              },
              orderBy: { order: "asc" },
            },
          },
        },
      },
    });

    if (!progress) {
      throw new Error("İlerleme kaydı bulunamadı");
    }

    // İlerleme yüzdesini hesapla
    const totalNodes = progress.path.nodes.length;
    const completedNodesCount = progress.completedNodes.length;
    const progressPercentage =
      totalNodes > 0 ? Math.round((completedNodesCount / totalNodes) * 100) : 0;

    return {
      ...progress,
      totalNodes,
      completedNodesCount,
      progressPercentage,
    };
  }

  // Yeni ilerleme başlat
  async startProgress(data: StartProgressData) {
    // Zaten başlamış mı kontrol et
    const existing = await prisma.userProgress.findUnique({
      where: {
        userId_pathId: {
          userId: data.userId,
          pathId: data.pathId,
        },
      },
    });

    if (existing) {
      return existing;
    }

    // İlk node'u bul
    const firstNode = await prisma.node.findFirst({
      where: { pathId: data.pathId },
      orderBy: { order: "asc" },
    });

    return await prisma.userProgress.create({
      data: {
        userId: data.userId,
        pathId: data.pathId,
        currentNodeId: firstNode?.id ?? null,
        completedNodes: [],
      },
      include: {
        path: {
          include: {
            category: true,
          },
        },
      },
    });
  }

  // Node'u tamamla
  async completeNode(userId: number, pathId: number, nodeId: number) {
    const progress = await prisma.userProgress.findUnique({
      where: {
        userId_pathId: {
          userId,
          pathId,
        },
      },
    });

    if (!progress) {
      throw new Error("İlerleme kaydı bulunamadı. Önce başlatmalısınız.");
    }

    // Node zaten tamamlanmış mı?
    if (progress.completedNodes.includes(nodeId)) {
      return progress;
    }

    // Tamamlanan node'ları güncelle
    const updatedCompletedNodes = [...progress.completedNodes, nodeId];

    // Sonraki node'u bul
    const nextNode = await prisma.node.findFirst({
      where: {
        pathId,
        order: {
          gt:
            (await prisma.node.findUnique({ where: { id: nodeId } }))?.order ||
            0,
        },
      },
      orderBy: { order: "asc" },
    });

    // Tüm node'lar tamamlandı mı?
    const totalNodes = await prisma.node.count({ where: { pathId } });
    const isCompleted = updatedCompletedNodes.length >= totalNodes;

    return await prisma.userProgress.update({
      where: {
        userId_pathId: {
          userId,
          pathId,
        },
      },
      data: {
        completedNodes: updatedCompletedNodes,
        currentNodeId: nextNode?.id || progress.currentNodeId,
        completedAt: isCompleted ? new Date() : null,
      },
      include: {
        path: {
          include: {
            category: true,
            nodes: true,
          },
        },
      },
    });
  }

  // İlerlemeyi sıfırla
  async resetProgress(userId: number, pathId: number) {
    const firstNode = await prisma.node.findFirst({
      where: { pathId },
      orderBy: { order: "asc" },
    });

    return await prisma.userProgress.update({
      where: {
        userId_pathId: {
          userId,
          pathId,
        },
      },
      data: {
        completedNodes: [],
        currentNodeId: firstNode?.id ?? null,
        completedAt: null,
      },
    });
  }

  // İstatistikler
  async getUserStats(userId: number) {
    const allProgress = await prisma.userProgress.findMany({
      where: { userId },
      include: {
        path: {
          include: {
            nodes: true,
          },
        },
      },
    });

    const totalPaths = allProgress.length;
    const completedPaths = allProgress.filter(
      (p) => p.completedAt !== null
    ).length;
    const inProgressPaths = totalPaths - completedPaths;

    const totalNodes = allProgress.reduce(
      (sum, p) => sum + p.path.nodes.length,
      0
    );
    const completedNodes = allProgress.reduce(
      (sum, p) => sum + p.completedNodes.length,
      0
    );

    return {
      totalPaths,
      completedPaths,
      inProgressPaths,
      totalNodes,
      completedNodes,
      overallProgress:
        totalNodes > 0 ? Math.round((completedNodes / totalNodes) * 100) : 0,
    };
  }
}
