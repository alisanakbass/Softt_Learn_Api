import { prisma } from "../config/database.js";

export interface CreateNodeData {
  title: string;
  description?: string | undefined;
  order: number;
  pathId: number;
  parentId?: number | undefined;
  contentId?: number | undefined;
}

export interface UpdateNodeData {
  title?: string | undefined;
  description?: string | undefined;
  order?: number | undefined;
  parentId?: number | undefined;
  contentId?: number | undefined;
}

export class NodeService {
  // Tüm node'ları getir (path'e göre)
  async getAll(pathId: number) {
    return await prisma.node.findMany({
      where: { pathId },
      include: {
        content: true,
        children: true,
        parent: true,
      },
      orderBy: { order: "asc" },
    });
  }

  // ID'ye göre node getir
  async getById(id: number) {
    const node = await prisma.node.findUnique({
      where: { id },
      include: {
        content: {
          include: {
            questions: true,
          },
        },
        children: {
          orderBy: { order: "asc" },
        },
        parent: true,
        path: {
          include: {
            category: true,
          },
        },
      },
    });

    if (!node) {
      throw new Error("Node bulunamadı");
    }

    return node;
  }

  // Yeni node oluştur
  async create(data: CreateNodeData) {
    return await prisma.node.create({
      data: {
        ...data,
        description: data.description ?? null,
        parentId: data.parentId ?? null,
        contentId: data.contentId ?? null,
      },
      include: {
        content: true,
        children: true,
        parent: true,
      },
    });
  }

  // Node güncelle
  async update(id: number, data: UpdateNodeData) {
    const updateData: any = { ...data };
    if ("description" in data)
      updateData.description = data.description ?? null;
    if ("parentId" in data) updateData.parentId = data.parentId ?? null;
    if ("contentId" in data) updateData.contentId = data.contentId ?? null;

    return await prisma.node.update({
      where: { id },
      data: updateData,
      include: {
        content: true,
        children: true,
        parent: true,
      },
    });
  }

  // Node sil
  async delete(id: number) {
    return await prisma.node.delete({
      where: { id },
    });
  }

  // Ağaç yapısını getir (root node'lardan başlayarak)
  async getTree(pathId: number) {
    // Önce tüm node'ları çek
    const allNodes = await prisma.node.findMany({
      where: { pathId },
      include: {
        content: true,
      },
      orderBy: { order: "asc" },
    });

    // Node'ları ID'ye göre map'e dönüştür
    const nodeMap = new Map();
    allNodes.forEach((node) => {
      nodeMap.set(node.id, { ...node, children: [] });
    });

    // Root node'ları ve children ilişkilerini oluştur
    const rootNodes: any[] = [];
    allNodes.forEach((node) => {
      const nodeWithChildren = nodeMap.get(node.id);
      if (node.parentId === null) {
        rootNodes.push(nodeWithChildren);
      } else {
        const parent = nodeMap.get(node.parentId);
        if (parent) {
          parent.children.push(nodeWithChildren);
        }
      }
    });

    // Her seviyede children'ı order'a göre sırala
    const sortChildren = (nodes: any[]) => {
      nodes.sort((a, b) => a.order - b.order);
      nodes.forEach((node) => {
        if (node.children && node.children.length > 0) {
          sortChildren(node.children);
        }
      });
    };

    sortChildren(rootNodes);
    rootNodes.forEach((node) => {
      if (node.children && node.children.length > 0) {
        sortChildren(node.children);
      }
    });

    return rootNodes;
  }

  // Node'ları yeniden sırala
  async reorder(updates: { id: number; order: number }[]) {
    const transactions = updates.map((update) =>
      prisma.node.update({
        where: { id: update.id },
        data: { order: update.order },
      })
    );

    return await prisma.$transaction(transactions);
  }
}
