import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { progressService } from "../services/progressService";
import type { UserProgress, UserStats } from "../services/progressService";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";
import { StatsSkeleton, PathCardSkeleton } from "../components/Skeleton";

export default function Dashboard() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();

  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [resetPathId, setResetPathId] = useState<number | null>(null);
  const [abandonPathId, setAbandonPathId] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const [progressRes, statsRes] = await Promise.all([
        progressService.getUserProgress(),
        progressService.getUserStats(),
      ]);

      if (progressRes.success) setProgress(progressRes.data);
      if (statsRes.success) setStats(statsRes.data);
    } catch (error) {
      console.error("Veri yüklenirken hata:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleResetProgress = async () => {
    if (!resetPathId) return;
    try {
      setLoading(true);
      await progressService.resetProgress(resetPathId);
      setResetPathId(null);
      toast.success("Eğitim ilerlemesi sıfırlandı.");
      loadData();
    } catch (error) {
      console.error("Sıfırlama hatası:", error);
      toast.error("İlerleme sıfırlanırken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleAbandonPath = async () => {
    if (!abandonPathId) return;
    try {
      setLoading(true);
      await progressService.abandonProgress(abandonPathId);
      setAbandonPathId(null);
      toast.success("Eğitimden ayrıldınız.");
      loadData();
    } catch (error) {
      console.error("Vazgeçme hatası:", error);
      toast.error("Eğitimden ayrılırken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-slate-900 relative selection:bg-indigo-600 selection:text-white">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3" />
      </div>

      <header className="nav-header">
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
            {/* Brand/Welcome Section */}
            <div className="flex items-center gap-4 group">
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-600 rounded-2xl rotate-6 opacity-20 group-hover:rotate-12 transition-transform duration-300"></div>
                <div className="relative w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 text-white transform group-hover:-translate-y-1 transition-transform duration-300">
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
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                  </svg>
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-100 tracking-tight group-hover:text-indigo-400 transition-colors">
                  Kontrol Paneli
                </h1>
                <p
                  onClick={() => navigate("/profile")}
                  className="text-xs font-bold text-indigo-500 uppercase tracking-wider hover:text-indigo-700 cursor-pointer transition-colors"
                >
                  HOŞ GELDİN, {user?.name?.toUpperCase()}
                </p>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-4">
              <nav className="flex items-center gap-3 p-1.5 bg-slate-800/50 rounded-2xl border border-slate-700 shadow-sm backdrop-blur-md">
                <button
                  onClick={() => navigate("/")}
                  className="flex items-center gap-2 px-4 py-2.5 text-slate-300 hover:text-indigo-400 hover:bg-slate-800 rounded-xl transition-all duration-200 font-medium group"
                >
                  <span className="p-1 rounded-lg bg-slate-700 text-slate-400 group-hover:bg-indigo-900/50 group-hover:text-indigo-400 transition-colors">
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
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                  </span>
                  <span className="hidden sm:inline">Ana Sayfa</span>
                </button>

                {user?.role === "ADMIN" && (
                  <button
                    onClick={() => navigate("/admin/users")}
                    className="flex items-center gap-2 px-4 py-2.5 text-slate-300 hover:text-indigo-400 hover:bg-slate-800 rounded-xl transition-all duration-200 font-medium group"
                  >
                    <span className="p-1 rounded-lg bg-slate-700 text-slate-400 group-hover:bg-indigo-900/50 group-hover:text-indigo-400 transition-colors">
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
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                    </span>
                    <span className="hidden sm:inline">Kullanıcı Yönetimi</span>
                  </button>
                )}

                <div className="w-px h-6 bg-slate-700 mx-1"></div>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-red-400 hover:text-red-300 hover:bg-red-900/30 px-4 py-2.5 rounded-xl transition-all duration-200 font-medium group"
                >
                  <span>Çıkış Yap</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 group-hover:translate-x-1 transition-transform"
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
                </button>
              </nav>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {loading && !stats ? (
          <StatsSkeleton />
        ) : (
          stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Toplam Yol</p>
                    <p className="text-3xl font-bold text-indigo-600">
                      {stats.totalPaths}
                    </p>
                  </div>
                  <span className="text-4xl">📚</span>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Tamamlanan</p>
                    <p className="text-3xl font-bold text-green-600">
                      {stats.completedPaths}
                    </p>
                  </div>
                  <span className="text-4xl">✅</span>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Devam Eden</p>
                    <p className="text-3xl font-bold text-yellow-600">
                      {stats.inProgressPaths}
                    </p>
                  </div>
                  <span className="text-4xl">⏳</span>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Genel İlerleme</p>
                    <p className="text-3xl font-bold text-indigo-600">
                      {stats.overallProgress}%
                    </p>
                  </div>
                  <span className="text-4xl">🎯</span>
                </div>
              </div>
            </div>
          )
        )}

        <div className="card">
          <h2 className="text-2xl font-bold mb-6 text-slate-100">
            🚀 Eğitimlerim
          </h2>

          {loading && progress.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <PathCardSkeleton key={i} />
              ))}
            </div>
          ) : progress.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-400 mb-4">
                Henüz bir eğitime başlamadınız.
              </p>
              <button
                onClick={() => navigate("/")}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
              >
                Eğitimleri Keşfet
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {progress.map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigate(`/path/${item.pathId}`)}
                  className="border-2 border-slate-700 rounded-lg p-6 hover:border-indigo-500 cursor-pointer transition bg-slate-800/50"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-100">
                        {item.path?.title || `Eğitim #${item.pathId}`}
                      </h3>
                      {item.path?.category && (
                        <p className="text-sm text-slate-400 mt-1">
                          📁 {item.path.category.name}
                        </p>
                      )}
                    </div>
                    {item.completedAt ? (
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                        ✓ Tamamlandı
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                        Devam Ediyor
                      </span>
                    )}
                  </div>

                  <div className="flex justify-between items-center gap-2 mb-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setResetPathId(item.pathId);
                      }}
                      className="flex-1 py-2 px-3 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                      title="İlerlemeyi Sıfırla"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      Yeniden Başla
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setAbandonPathId(item.pathId);
                      }}
                      className="flex-1 py-2 px-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                      title="Eğitimden Ayrıl"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      Eğitimi Bırak
                    </button>
                  </div>

                  <div className="mb-2">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>İlerleme</span>
                      <span>{item.progressPercentage || 0}%</span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-indigo-600 h-3 rounded-full transition-all"
                        style={{ width: `${item.progressPercentage || 0}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex justify-between text-sm text-slate-400 mt-3">
                    <span>
                      {item.completedNodesCount || 0} / {item.totalNodes || 0}{" "}
                      tamamlandı
                    </span>
                    <span>
                      Son erişim:{" "}
                      {new Date(item.lastAccessedAt).toLocaleDateString(
                        "tr-TR"
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Reset Confirmation Modal */}
      {resetPathId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"></div>
          <div className="relative bg-white rounded-2xl shadow-xl border border-gray-100 p-6 max-w-sm w-full animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <svg
                  className="h-6 w-6 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Sıfırla</h3>
                <p className="text-sm text-gray-500">
                  Bu eğitimin ilerlemesini sıfırlamak istediğinize emin misiniz?
                  En başa döneceksiniz.
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setResetPathId(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleResetProgress}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
              >
                Evet, Sıfırla
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Abandon Confirmation Modal */}
      {abandonPathId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"></div>
          <div className="relative bg-white rounded-2xl shadow-xl border border-gray-100 p-6 max-w-sm w-full animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Eğitimi Bırak
                </h3>
                <p className="text-sm text-gray-500">
                  Bu eğitimi listenizden çıkarmak istediğinize emin misiniz? Tüm
                  ilerlemeniz silinecektir.
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setAbandonPathId(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleAbandonPath}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 shadow-lg shadow-red-200 transition-all"
              >
                Evet, Bırak
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
