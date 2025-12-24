import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { progressService } from "../services/progressService";
import type { UserProgress, UserStats } from "../services/progressService";
import { useAuthStore } from "../store/authStore";

export default function Dashboard() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();

  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    loadData();
  }, [isAuthenticated, navigate]);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 relative selection:bg-indigo-100 selection:text-indigo-700">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-100 rounded-full blur-3xl opacity-40 translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-100 rounded-full blur-3xl opacity-40 -translate-x-1/3 translate-y-1/3" />
      </div>

      <header className="bg-white/80 backdrop-blur-xl border-b border-indigo-50/50 sticky top-0 z-30 shadow-sm transition-all duration-300">
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
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight group-hover:text-indigo-700 transition-colors">
                  Kontrol Paneli
                </h1>
                <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wider">
                  HOŞ GELDİN, {user?.name?.toUpperCase()}
                </p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex items-center gap-3 p-1.5 bg-white/50 rounded-2xl border border-gray-100/50 shadow-sm backdrop-blur-md">
              <button
                onClick={() => navigate("/")}
                className="flex items-center gap-2 px-4 py-2.5 text-gray-600 hover:text-indigo-600 hover:bg-white rounded-xl transition-all duration-200 font-medium group"
              >
                <span className="p-1 rounded-lg bg-gray-100 text-gray-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
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
                  className="flex items-center gap-2 px-4 py-2.5 text-gray-600 hover:text-indigo-600 hover:bg-white rounded-xl transition-all duration-200 font-medium group"
                >
                  <span className="p-1 rounded-lg bg-gray-100 text-gray-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
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

              <div className="w-px h-6 bg-gray-200 mx-1"></div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-red-500 hover:text-red-700 hover:bg-red-50 px-4 py-2.5 rounded-xl transition-all duration-200 font-medium group"
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
      </header>

      <main className="container mx-auto px-4 py-8">
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Toplam Yol</p>
                  <p className="text-3xl font-bold text-indigo-600">
                    {stats.totalPaths}
                  </p>
                </div>
                <span className="text-4xl">📚</span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Tamamlanan</p>
                  <p className="text-3xl font-bold text-green-600">
                    {stats.completedPaths}
                  </p>
                </div>
                <span className="text-4xl">✅</span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Devam Eden</p>
                  <p className="text-3xl font-bold text-yellow-600">
                    {stats.inProgressPaths}
                  </p>
                </div>
                <span className="text-4xl">⏳</span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Genel İlerleme</p>
                  <p className="text-3xl font-bold text-indigo-600">
                    {stats.overallProgress}%
                  </p>
                </div>
                <span className="text-4xl">🎯</span>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl p-6 shadow-md">
          <h2 className="text-2xl font-bold mb-6">🚀 Öğrenme Yollarım</h2>

          {progress.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">
                Henüz bir öğrenme yoluna başlamadınız.
              </p>
              <button
                onClick={() => navigate("/")}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
              >
                Öğrenme Yollarını Keşfet
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {progress.map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigate(`/path/${item.pathId}`)}
                  className="border-2 border-gray-200 rounded-lg p-6 hover:border-indigo-400 cursor-pointer transition"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">
                        {item.path?.title || `Öğrenme Yolu #${item.pathId}`}
                      </h3>
                      {item.path?.category && (
                        <p className="text-sm text-gray-600 mt-1">
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

                  <div className="flex justify-between text-sm text-gray-600 mt-3">
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
    </div>
  );
}
