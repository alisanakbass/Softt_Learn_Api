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
import toast from "react-hot-toast";

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
  const [deleteNodeId, setDeleteNodeId] = useState<number | null>(null);

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

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isModalOpen || isContentModalOpen || deleteNodeId !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isModalOpen, isContentModalOpen, deleteNodeId]);

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
      toast.success("Sıralama güncellendi.");
    } catch (error) {
      console.error("Sıralama güncellenemedi:", error);
      toast.error("Sıralama güncellenemedi.");
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
        toast.success("İçerik başarıyla güncellendi.");
      } else {
        await nodeService.create({
          ...formData,
          pathId: parseInt(id),
          order: nodes.length, // Add to end
        });
        toast.success("İçerik başarıyla oluşturuldu.");
      }

      setIsModalOpen(false);
      setEditingNode(null);
      setFormData({ title: "", description: "" });
      loadData();
    } catch (error) {
      console.error("Kaydetme hatası:", error);
      toast.error("Kaydedilirken bir hata oluştu.");
    }
  };

  const handleDelete = (nodeId: number) => {
    setDeleteNodeId(nodeId);
  };

  const confirmDelete = async () => {
    if (!deleteNodeId) return;
    try {
      await nodeService.delete(deleteNodeId);
      toast.success("İçerik başarıyla silindi.");
      setDeleteNodeId(null);
      loadData();
    } catch (error) {
      console.error("Silme hatası:", error);
      toast.error("Silinirken bir hata oluştu.");
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
    <div className="min-h-screen bg-slate-900 relative selection:bg-indigo-600 selection:text-white">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-sky-600/10 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3" />
      </div>

      <header className={`nav-header ${isContentModalOpen ? "hidden" : ""}`}>
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4 w-full">
              <button
                onClick={() => navigate("/")}
                className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-indigo-600 flex items-center justify-center transition-all group shrink-0"
                title="Geri Dön"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-slate-400 group-hover:text-indigo-400 transition-colors"
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
                <h1 className="text-2xl font-bold text-slate-100 truncate">
                  {pathTitle || "Yükleniyor..."}
                </h1>
                <p
                  onClick={() => navigate("/profile")}
                  className="text-xs font-bold text-indigo-500 uppercase tracking-wider hover:text-indigo-700 cursor-pointer transition-colors"
                >
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
                          card-hover
                          ${
                            snapshot.isDragging
                              ? "shadow-2xl scale-[1.02] border-indigo-500 rotate-1 z-50"
                              : "hover:shadow-xl"
                          }
                        `}
                      >
                        <div className="flex items-start gap-4">
                          {/* Drag Handle */}
                          <div
                            {...provided.dragHandleProps}
                            className="mt-1 p-2 rounded-lg cursor-grab active:cursor-grabbing text-slate-500 hover:text-indigo-400 hover:bg-indigo-900/30 transition-colors"
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
                              <h3 className="font-bold text-slate-100 text-lg truncate">
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
                              <p className="text-slate-400 text-sm line-clamp-1 mb-1">
                                {node.description}
                              </p>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 transition-opacity duration-200">
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
                              className="p-2 text-slate-500 hover:text-indigo-400 hover:bg-indigo-900/30 rounded-lg transition-colors"
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
                              className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-900/30 rounded-lg transition-colors"
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
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
            style={{ zIndex: 9999 }}
          >
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 w-full max-w-md shadow-2xl">
              <h2 className="text-2xl font-bold mb-6 text-slate-100">
                {editingNode ? "Başlığı Düzenle" : "Yeni Başlık Ekle"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-2 ml-1">
                    Başlık
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 text-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-all placeholder:text-slate-500"
                    placeholder="Örn: Değişkenler nedir?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-2 ml-1">
                    Açıklama (İsteğe bağlı)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 text-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-all placeholder:text-slate-500 resize-none"
                    rows={3}
                    placeholder="Kısa bir açıklama..."
                  />
                </div>

                <div className="flex gap-3 justify-end mt-6">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 text-slate-300 hover:bg-slate-700 rounded-xl font-semibold transition-all border border-slate-700 hover:border-slate-600"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-semibold shadow-lg shadow-indigo-900/50 hover:shadow-xl hover:shadow-indigo-900/60 transition-all active:scale-95"
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

      {/* Delete Confirmation Modal */}
      {deleteNodeId && (
        <div
          className="fixed inset-0 overflow-y-auto"
          style={{ zIndex: 10000 }}
        >
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-black/75 backdrop-blur-sm"></div>
            </div>

            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>

            <div className="inline-block align-bottom bg-slate-800 rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-slate-700">
              <div className="bg-slate-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-900/30 border border-red-800 sm:mx-0 sm:h-10 sm:w-10">
                    <svg
                      className="h-6 w-6 text-red-400"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-bold text-slate-100">
                      İçeriği Sil
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-slate-400">
                        Bu içeriği silmek istediğinize emin misiniz? Bu işlem
                        geri alınamaz.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-slate-900/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-2">
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="w-full inline-flex justify-center rounded-xl border border-transparent shadow-lg px-5 py-2.5 bg-red-600 text-base font-semibold text-white hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm shadow-red-900/50 hover:shadow-xl hover:shadow-red-900/60 transition-all duration-200 active:scale-95"
                >
                  Evet, Sil
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteNodeId(null)}
                  className="mt-3 w-full inline-flex justify-center rounded-xl border border-slate-700 shadow-sm px-5 py-2.5 bg-slate-800 text-base font-semibold text-slate-300 hover:bg-slate-700 hover:border-slate-600 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-all duration-200"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
