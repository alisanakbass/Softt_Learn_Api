import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import { pathService } from "../services/pathService";
import { nodeService, type Node } from "../services/nodeService";
import { useAuthStore } from "../store/authStore";
import ContentEditorModal from "../components/ContentEditorModal";

export default function PathEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [nodes, setNodes] = useState<Node[]>([]);
  const [loading, setLoading] = useState(true);
  const [pathTitle, setPathTitle] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNode, setEditingNode] = useState<Node | null>(null);

  // Content Editor State
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [selectedContentId, setSelectedContentId] = useState<
    number | undefined
  >();
  const [targetNodeIdForNewContent, setTargetNodeIdForNewContent] = useState<
    number | null
  >(null);

  // Form states
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

  const loadData = useCallback(async () => {
    try {
      if (!id) return;
      setLoading(true);

      const [pathRes, nodesRes] = await Promise.all([
        pathService.getById(parseInt(id)),
        nodeService.getAll(parseInt(id)),
      ]);

      if (pathRes.success) setPathTitle(pathRes.data.title);
      if (nodesRes.success) setNodes(nodesRes.data);
    } catch (error) {
      console.error("Veri yüklenirken hata:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!user || user.role === "STUDENT") {
      navigate("/");
      return;
    }
    loadData();
  }, [id, user, navigate, loadData]);

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(nodes);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update local state immediately for UI responsiveness
    setNodes(items);

    // Prepare updates for backend
    const updates = items.map((node, index) => ({
      id: node.id,
      order: index,
    }));

    try {
      await nodeService.reorder(updates);
    } catch (error) {
      console.error("Sıralama güncellenemedi:", error);
      // Revert on error (optional implementation)
      loadData();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      if (editingNode) {
        await nodeService.update(editingNode.id, formData);
      } else {
        await nodeService.create({
          ...formData,
          pathId: parseInt(id),
          order: nodes.length, // Add to end
        });
      }

      setIsModalOpen(false);
      setEditingNode(null);
      setFormData({ title: "", description: "" });
      loadData();
    } catch (error) {
      console.error("Kaydetme hatası:", error);
    }
  };

  const handleDelete = async (nodeId: number) => {
    if (!window.confirm("Bu içeriği silmek istediğinize emin misiniz?")) return;

    try {
      await nodeService.delete(nodeId);
      loadData();
    } catch (error) {
      console.error("Silme hatası:", error);
    }
  };

  const openModal = (node?: Node) => {
    if (node) {
      setEditingNode(node);
      setFormData({
        title: node.title,
        description: node.description || "",
      });
    } else {
      setEditingNode(null);
      setFormData({ title: "", description: "" });
    }
    setIsModalOpen(true);
  };

  const openContentEditor = (node: Node) => {
    if (node.contentId) {
      setSelectedContentId(node.contentId);
      setTargetNodeIdForNewContent(null);
    } else {
      setSelectedContentId(undefined);
      setTargetNodeIdForNewContent(node.id);
    }
    setIsContentModalOpen(true);
  };

  if (loading)
    return <div className="p-8 text-center text-xl">Yükleniyor...</div>;

  return (
    <div className="min-h-screen bg-slate-50 relative selection:bg-indigo-100 selection:text-indigo-700">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-100 rounded-full blur-3xl opacity-40 translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-sky-100 rounded-full blur-3xl opacity-40 -translate-x-1/3 translate-y-1/3" />
      </div>

      <header className="bg-white/80 backdrop-blur-xl border-b border-indigo-50/50 sticky top-0 z-30 shadow-sm transition-all duration-300">
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4 w-full">
              <button
                onClick={() => navigate("/dashboard")}
                className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-indigo-50 border border-gray-200 hover:border-indigo-100 flex items-center justify-center transition-all group shrink-0"
                title="Geri Dön"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-500 group-hover:text-indigo-600 transition-colors"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 12H5" />
                  <path d="M12 19l-7-7 7-7" />
                </svg>
              </button>

              <div className="min-w-0">
                <h1 className="text-2xl font-bold text-gray-900 truncate">
                  {pathTitle || "Yükleniyor..."}
                </h1>
                <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wider">
                  Eğitim Müfredatı Yönetimi
                </p>
              </div>
            </div>

            <button
              onClick={() => openModal()}
              className="shrink-0 flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 active:scale-95 transition-all duration-200 font-semibold shadow-md shadow-indigo-100"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>Yeni İçerik Ekle</span>
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 max-w-4xl py-8 relative z-10">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="nodes">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-4"
              >
                {nodes.map((node, index) => (
                  <Draggable
                    key={node.id}
                    draggableId={node.id.toString()}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`
                          group relative bg-white rounded-2xl p-5 border transition-all duration-200
                          ${
                            snapshot.isDragging
                              ? "shadow-2xl scale-[1.02] border-indigo-300 rotate-1 z-50"
                              : "shadow-sm border-gray-100 hover:border-indigo-200 hover:shadow-md"
                          }
                        `}
                      >
                        <div className="flex items-start gap-4">
                          {/* Drag Handle */}
                          <div
                            {...provided.dragHandleProps}
                            className="mt-1 p-2 rounded-lg cursor-grab active:cursor-grabbing text-gray-300 hover:text-indigo-500 hover:bg-indigo-50 transition-colors"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-6 w-6"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <circle cx="9" cy="12" r="1" />
                              <circle cx="9" cy="5" r="1" />
                              <circle cx="9" cy="19" r="1" />
                              <circle cx="15" cy="12" r="1" />
                              <circle cx="15" cy="5" r="1" />
                              <circle cx="15" cy="19" r="1" />
                            </svg>
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-bold text-gray-900 text-lg truncate">
                                {node.title}
                              </h3>
                              {node.content ? (
                                <span
                                  className={`
                                  px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wide border
                                  ${
                                    node.content.type === "VIDEO"
                                      ? "bg-red-50 text-red-600 border-red-100"
                                      : node.content.type === "ARTICLE"
                                      ? "bg-blue-50 text-blue-600 border-blue-100"
                                      : node.content.type === "QUIZ"
                                      ? "bg-purple-50 text-purple-600 border-purple-100"
                                      : "bg-gray-50 text-gray-600 border-gray-100"
                                  }
                                `}
                                >
                                  {node.content.type}
                                </span>
                              ) : (
                                <span className="px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wide bg-amber-50 text-amber-600 border border-amber-100">
                                  İçerik Yok
                                </span>
                              )}
                            </div>

                            {node.description && (
                              <p className="text-gray-500 text-sm line-clamp-1 mb-1">
                                {node.description}
                              </p>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <button
                              onClick={() => openContentEditor(node)}
                              className={`
                                flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors
                                ${
                                  node.contentId
                                    ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                                    : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                                }
                               `}
                            >
                              {node.contentId ? (
                                <>
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                  </svg>
                                  <span>Düzenle</span>
                                </>
                              ) : (
                                <>
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <line x1="12" y1="5" x2="12" y2="19" />
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                  </svg>
                                  <span>Ekle</span>
                                </>
                              )}
                            </button>

                            <button
                              onClick={() => openModal(node)}
                              className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="Başlığı Düzenle"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                              </svg>
                            </button>

                            <button
                              onClick={() => handleDelete(node.id)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Sil"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                <line x1="10" y1="11" x2="10" y2="17" />
                                <line x1="14" y1="11" x2="14" y2="17" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {/* Node Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-8 w-full max-w-md">
              <h2 className="text-2xl font-bold mb-6">
                {editingNode ? "Başlığı Düzenle" : "Yeni Başlık Ekle"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Başlık
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="Örn: Değişkenler nedir?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Açıklama (İsteğe bağlı)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    rows={3}
                    placeholder="Kısa bir açıklama..."
                  />
                </div>

                <div className="flex gap-3 justify-end mt-6">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Kaydet
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Content Editor Modal */}
        <ContentEditorModal
          isOpen={isContentModalOpen}
          onClose={() => setIsContentModalOpen(false)}
          contentId={selectedContentId}
          onSuccess={async (newContentId) => {
            if (targetNodeIdForNewContent) {
              try {
                await nodeService.update(targetNodeIdForNewContent, {
                  contentId: newContentId,
                });
              } catch (error) {
                console.error("İçerik node'a bağlanırken hata:", error);
              }
            }
            loadData();
            setIsContentModalOpen(false);
          }}
        />
      </div>
    </div>
  );
}
