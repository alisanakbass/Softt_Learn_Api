import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { categoryService } from "../services/categoryService";
import type { Category } from "../services/categoryService";
import { pathService } from "../services/pathService";
import type { LearningPath } from "../services/pathService";
import { useAuthStore } from "../store/authStore";

import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import toast from "react-hot-toast";
import { PathCardSkeleton, CategorySkeleton } from "../components/Skeleton";

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<
    number | undefined
  >();

  /* Pagination State */
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  /* Reorder State */
  const [isReordering, setIsReordering] = useState(false);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null);

  /* Path Modal State */
  const [showModal, setShowModal] = useState(false);
  const [editingPath, setEditingPath] = useState<LearningPath | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    categoryId: 0,
    difficulty: "BEGINNER" as "BEGINNER" | "INTERMEDIATE" | "ADVANCED",
    description: "",
  });
  const [deletePathId, setDeletePathId] = useState<number | null>(null);

  const resetForm = () => {
    setFormData({
      title: "",
      categoryId: 0,
      difficulty: "BEGINNER",
      description: "",
    });
    setEditingPath(null);
  };

  const handleSubmitPath = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.categoryId) {
      toast.error("Lütfen başlık ve kategori seçiniz.");
      return;
    }

    try {
      setLoading(true);
      if (editingPath) {
        const response = await pathService.update(editingPath.id, formData);
        if (response.success) {
          toast.success("Eğitim başarıyla güncellendi.");
          setShowModal(false);
          resetForm();
          loadData();
        }
      } else {
        const response = await pathService.create(formData);
        if (response.success && response.data) {
          toast.success("Eğitim başarıyla oluşturuldu.");
          setShowModal(false);
          resetForm();
          navigate(`/editor/path/${response.data.id}`);
        }
      }
    } catch (error) {
      console.error("İşlem hatası:", error);
      toast.error("Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (path: LearningPath) => {
    setEditingPath(path);
    setFormData({
      title: path.title,
      categoryId: path.categoryId,
      difficulty: path.difficulty || "BEGINNER",
      description: path.description || "",
    });
    setShowModal(true);
  };

  const handleDeletePath = (id: number) => {
    setDeletePathId(id);
  };

  const confirmDeletePath = async () => {
    if (!deletePathId) return;
    try {
      setLoading(true);
      await pathService.delete(deletePathId);
      toast.success("Eğitim başarıyla silindi.");
      setDeletePathId(null);
      loadData();
    } catch (error) {
      console.error("Silme hatası:", error);
      toast.error(
        "Bu eğitim silinemiyor. Muhtemelen içinde dersler veya öğrenci ilerlemeleri kayıtlı. Lütfen önce içeriği temizlemeyi deneyin."
      );
    } finally {
      setLoading(false);
    }
  };

  /* Search & Filter State */
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<
    string | undefined
  >();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [categoriesRes, pathsRes] = await Promise.all([
        categoryService.getAll(),
        pathService.getAll(
          selectedCategory,
          difficultyFilter,
          debouncedSearch,
          page,
          isReordering ? 100 : 9
        ),
      ]);

      if (categoriesRes.success) setCategories(categoriesRes.data);
      if (pathsRes.success && pathsRes.data) {
        setPaths(pathsRes.data);
        if (pathsRes.pagination) {
          setTotalPages(pathsRes.pagination.totalPages);
        }
      }
    } catch (error) {
      console.error("Veri yüklenirken hata:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, difficultyFilter, debouncedSearch, page, isReordering]);

  // Arama için debounce efekti
  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmedQuery = searchQuery.trim();
      if (trimmedQuery.length >= 3 || trimmedQuery.length === 0) {
        setDebouncedSearch(trimmedQuery);
        setPage(1);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Tüm veri yükleme tetikleyicilerini tek noktada birleştir
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Reorder Modu Aç/Kapa
  const toggleReorderMode = () => {
    setIsReordering(!isReordering);
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(paths);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setPaths(items);

    // Backend güncelleme
    const updates = items.map((path, index) => ({
      id: path.id,
      order: index + (page - 1) * 9, // Global order hesaplama (basitçe)
    }));

    try {
      await pathService.reorder(updates);
      toast.success("Sıralama güncellendi.");
    } catch (error) {
      console.error("Sıralama hatası:", error);
      toast.error("Sıralama kaydedilemedi.");
      loadData(); // Hata varsa geri al
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const difficultyColors = {
    BEGINNER: "bg-green-100 text-green-800",
    INTERMEDIATE: "bg-yellow-100 text-yellow-800",
    ADVANCED: "bg-red-100 text-red-800",
  };

  const handleAutoSort = () => {
    const weights: Record<string, number> = {
      BEGINNER: 1,
      INTERMEDIATE: 2,
      ADVANCED: 3,
    };

    const newOrder = sortOrder === "asc" ? "desc" : "asc";
    setSortOrder(newOrder);

    const sorted = [...paths].sort((a, b) => {
      const wA = weights[a.difficulty || ""] || 99;
      const wB = weights[b.difficulty || ""] || 99;

      return newOrder === "asc" ? wA - wB : wB - wA;
    });

    setPaths(sorted);
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-slate-900 transition-colors duration-300 relative selection:bg-indigo-600 selection:text-white">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3" />
      </div>

      {/* Path Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content w-full max-w-md p-8">
            <h2 className="text-2xl font-bold mb-6 text-slate-100 flex items-center gap-2">
              <span className="p-2 bg-indigo-900/50 rounded-lg text-indigo-400">
                {editingPath ? "✏️" : "✨"}
              </span>
              {editingPath ? "Eğitimi Düzenle" : "Yeni Eğitim Ekle"}
            </h2>
            <form onSubmit={handleSubmitPath} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1">
                  Başlık
                </label>
                <input
                  type="text"
                  required
                  className="input"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Örn: React Temelleri"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Kategori
                </label>
                <div className="relative">
                  <select
                    required
                    className="input appearance-none"
                    value={formData.categoryId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        categoryId: Number(e.target.value),
                      })
                    }
                  >
                    <option value={0}>Seçiniz...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                    ▼
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Zorluk Seviyesi
                </label>
                <div className="relative">
                  <select
                    className="input appearance-none"
                    value={formData.difficulty}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        difficulty: e.target.value as
                          | "BEGINNER"
                          | "INTERMEDIATE"
                          | "ADVANCED",
                      })
                    }
                  >
                    <option value="BEGINNER">Başlangıç</option>
                    <option value="INTERMEDIATE">Orta</option>
                    <option value="ADVANCED">İleri</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                    ▼
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Açıklama (İsteğe bağlı)
                </label>
                <textarea
                  className="input"
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      description: e.target.value,
                    })
                  }
                  placeholder="Kısa bir açıklama ekleyin..."
                />
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="btn-secondary flex-1"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none font-medium transition-all transform active:scale-95"
                >
                  {editingPath ? "Güncelle" : "Oluştur"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="nav-header">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Brand */}
            <div
              className="flex items-center gap-3 group cursor-pointer"
              onClick={() => navigate("/")}
            >
              <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 group-hover:shadow-indigo-300 transition-all duration-300 transform group-hover:rotate-3">
                <span className="text-xl font-bold">S</span>
              </div>
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-300">
                SoftLearn
              </span>
            </div>

            <nav className="flex items-center gap-4">
              {isAuthenticated ? (
                <>
                  <div
                    onClick={() => navigate("/profile")}
                    className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-full border border-slate-700 hover:bg-slate-700 hover:border-indigo-600 cursor-pointer transition-all group/user"
                  >
                    <div className="w-8 h-8 bg-indigo-900/50 rounded-full flex items-center justify-center text-indigo-300 font-bold border border-indigo-700 group-hover/user:bg-indigo-600 group-hover/user:text-white transition-all">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-slate-300 pr-2 group-hover/user:text-indigo-400 transition-colors">
                      {user?.name}
                    </span>
                  </div>

                  <div className="h-8 w-px bg-slate-700 mx-1 hidden md:block"></div>

                  <Link
                    to="/dashboard"
                    className="hidden md:flex items-center gap-2 px-4 py-2 text-slate-300 hover:text-indigo-400 hover:bg-slate-800 rounded-xl transition-all duration-200 font-medium"
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
                      <rect x="3" y="3" width="7" height="7" />
                      <rect x="14" y="3" width="7" height="7" />
                      <rect x="14" y="14" width="7" height="7" />
                      <rect x="3" y="14" width="7" height="7" />
                    </svg>
                    <span>Panel</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200 font-medium"
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
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    <span className="hidden sm:inline">Çıkış</span>
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    to="/login"
                    className="px-5 py-2.5 text-gray-600 hover:text-indigo-600 font-medium transition-colors"
                  >
                    Giriş Yap
                  </Link>
                  <Link
                    to="/register"
                    className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 font-medium transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                  >
                    Kayıt Ol
                  </Link>
                </div>
              )}
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
        {/* Sidebar: Kategoriler */}
        <aside className="w-full lg:w-72 flex-shrink-0 space-y-6">
          <div className="card sticky top-24">
            <h2 className="text-xl font-bold mb-4 text-slate-100 flex items-center gap-2">
              <span className="p-1.5 bg-indigo-100 rounded-lg text-indigo-600">
                📚
              </span>
              Kategoriler
            </h2>
            <div className="flex flex-col gap-2">
              {loading && categories.length === 0 ? (
                <CategorySkeleton />
              ) : (
                <>
                  <button
                    onClick={() => {
                      setSelectedCategory(undefined);
                      setPage(1);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-between group ${
                      selectedCategory === undefined
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/50"
                        : "bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <span>Tümü</span>
                    {selectedCategory === undefined && (
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
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    )}
                  </button>

                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => {
                        setSelectedCategory(category.id);
                        setPage(1);
                      }}
                      className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-between group ${
                        selectedCategory === category.id
                          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/50"
                          : "bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white"
                      }`}
                    >
                      <span>{category.name}</span>
                      {selectedCategory === category.id && (
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
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      )}
                    </button>
                  ))}
                </>
              )}
            </div>
          </div>
        </aside>

        {/* Main Content: Learning Paths */}
        <div className="flex-1">
          <section>
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="flex-1 relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Eğitimlerde ara..."
                  className="input pl-11"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="w-full md:w-48 relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                  </svg>
                </div>
                <select
                  className="input pl-11 appearance-none"
                  value={difficultyFilter || ""}
                  onChange={(e) => {
                    setDifficultyFilter(e.target.value || undefined);
                    setPage(1);
                  }}
                >
                  <option value="">Tüm Seviyeler</option>
                  <option value="BEGINNER">Başlangıç</option>
                  <option value="INTERMEDIATE">Orta Seviye</option>
                  <option value="ADVANCED">İleri Seviye</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  ▼
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-100">
                🚀 Eğitimler
                {selectedCategory && (
                  <span className="text-lg font-normal text-slate-400 ml-2">
                    ({categories.find((c) => c.id === selectedCategory)?.name})
                  </span>
                )}
              </h2>

              <div className="flex gap-2">
                <button
                  onClick={handleAutoSort}
                  className={`bg-white text-indigo-600 border px-4 py-2 rounded-lg transition flex items-center gap-2 shadow-sm ${
                    sortOrder
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-indigo-200 hover:bg-indigo-50"
                  }`}
                  title="Sıralama Değiştir"
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
                    {sortOrder === "desc" ? (
                      <>
                        <line x1="12" y1="4" x2="12" y2="14" />
                        <line x1="18" y1="4" x2="18" y2="20" />
                        <line x1="6" y1="4" x2="6" y2="8" />
                      </>
                    ) : (
                      <>
                        <line x1="12" y1="20" x2="12" y2="10" />
                        <line x1="18" y1="20" x2="18" y2="4" />
                        <line x1="6" y1="20" x2="6" y2="16" />
                      </>
                    )}
                  </svg>
                  <span className="hidden sm:inline">
                    {sortOrder === "asc"
                      ? "Kolay → Zor"
                      : sortOrder === "desc"
                      ? "Zor → Kolay"
                      : "Sırala"}
                  </span>
                </button>

                {/* Admin Buttons */}
                {(user?.role === "ADMIN" || user?.role === "TEACHER") && (
                  <>
                    <button
                      onClick={toggleReorderMode}
                      className={`px-4 py-2 rounded-lg transition border flex items-center gap-2 ${
                        isReordering
                          ? "bg-yellow-100 border-yellow-300 text-yellow-800"
                          : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {isReordering ? "✅ Kaydet" : "🔃 Düzenle"}
                    </button>
                    <button
                      onClick={() => setShowModal(true)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2 shadow-md"
                    >
                      <span className="text-xl">+</span> Yeni Eğitim
                    </button>
                  </>
                )}
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <PathCardSkeleton key={i} />
                ))}
              </div>
            ) : paths.length === 0 ? (
              <div className="card text-center">
                <div className="text-4xl mb-4">🔍</div>
                <p className="text-slate-400 text-lg mb-4">
                  {searchQuery
                    ? `"${searchQuery}" araması için sonuç bulunamadı.`
                    : selectedCategory
                    ? "Bu kategoride henüz eğitim bulunmuyor."
                    : "Henüz eğitim bulunmuyor."}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-indigo-600 font-medium hover:underline"
                  >
                    Aramayı Temizle
                  </button>
                )}
              </div>
            ) : (
              <>
                {isReordering ? (
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="paths" direction="horizontal">
                      {(provided) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
                        >
                          {paths.map((path, index) => (
                            <Draggable
                              key={path.id}
                              draggableId={path.id.toString()}
                              index={index}
                            >
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className="bg-white rounded-xl p-6 shadow-md border-2 border-indigo-200 cursor-move relative"
                                >
                                  <div className="absolute top-2 right-2 text-indigo-400">
                                    ⋮⋮
                                  </div>
                                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                                    {path.title}
                                  </h3>
                                  <p className="text-gray-500 text-sm">
                                    Sıra: {index + 1}
                                  </p>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {paths.map((path) => (
                      <Link
                        key={path.id}
                        to={`/path/${path.id}`}
                        className="card hover:shadow-xl transition transform hover:-translate-y-1 block group border border-slate-700"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-xl font-bold text-slate-100 group-hover:text-indigo-400 transition">
                            {path.title}
                          </h3>
                          {path.difficulty && (
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                difficultyColors[path.difficulty]
                              }`}
                            >
                              {path.difficulty}
                            </span>
                          )}
                        </div>

                        {path.description && (
                          <p className="text-slate-400 mb-4 line-clamp-3">
                            {path.description}
                          </p>
                        )}

                        {path.category && (
                          <div className="flex items-center text-sm text-slate-400 mb-4">
                            <span className="bg-gray-100 px-3 py-1 rounded-full border border-gray-100">
                              📁 {path.category.name}
                            </span>
                          </div>
                        )}

                        <div className="flex gap-2 mt-auto">
                          <div className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition font-medium text-center">
                            Başla
                          </div>
                          {(user?.role === "ADMIN" ||
                            user?.role === "TEACHER") && (
                            <div className="flex gap-1">
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  navigate(`/editor/path/${path.id}`);
                                }}
                                className="bg-gray-800 text-white p-2 rounded-lg hover:bg-gray-900 transition flex items-center justify-center"
                                title="İçeriği Yönet"
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
                                  <path d="M12 20h9" />
                                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                                </svg>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleEditClick(path);
                                }}
                                className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center"
                                title="Özellikleri Düzenle"
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
                                  <circle cx="12" cy="12" r="3" />
                                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                                </svg>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleDeletePath(path.id);
                                }}
                                className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition flex items-center justify-center"
                                title="Eğitimi Sil"
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
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Pagination (Reorder modunda gizle) */}
                {!isReordering && totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                    >
                      ← Önceki
                    </button>

                    <div className="flex gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (p) => (
                          <button
                            key={p}
                            onClick={() => setPage(p)}
                            className={`w-10 h-10 rounded-lg font-medium transition ${
                              page === p
                                ? "bg-indigo-600 text-white"
                                : "bg-white border border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            {p}
                          </button>
                        )
                      )}
                    </div>

                    <button
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={page === totalPages}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                    >
                      Sonraki →
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-800 mt-16 py-8 border-t border-slate-700 transition-colors">
        <div className="container mx-auto px-4 text-center text-slate-400">
          <p>© 2024 SoftLearn. Tüm hakları saklıdır.</p>
        </div>
      </footer>

      {/* Delete Confirmation Modal */}
      {deletePathId && (
        <div className="fixed inset-0 z-[100] overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-900/75 backdrop-blur-sm"></div>
            </div>

            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>

            <div className="inline-block align-bottom modal-content text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-900/30 sm:mx-0 sm:h-10 sm:w-10">
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
                      Eğitimi Sil
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-slate-400">
                        Bu eğitimi silmek istediğinize emin misiniz? Bu işlem
                        geri alınamaz ve eğitime ait tüm içerikler (dersler,
                        videolar, quizi'ler) ve öğrenci ilerlemeleri de
                        silinecektir.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-slate-700/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-2 border-t border-slate-700">
                <button
                  type="button"
                  onClick={confirmDeletePath}
                  className="btn-danger w-full sm:w-auto"
                >
                  Evet, Sil
                </button>
                <button
                  type="button"
                  onClick={() => setDeletePathId(null)}
                  className="btn-secondary mt-3 sm:mt-0 w-full sm:w-auto"
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
