import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { pathService } from "../services/pathService";
import type { LearningPath } from "../services/pathService";
import { nodeService } from "../services/nodeService";
import type { Node } from "../services/nodeService";
import { progressService } from "../services/progressService";
import type { UserProgress } from "../services/progressService";
import { useAuthStore } from "../store/authStore";

export default function PathDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const [path, setPath] = useState<LearningPath | null>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const pathId = parseInt(id!);

      const pathRes = await pathService.getById(pathId);
      if (pathRes.success) {
        setPath(pathRes.data);
      }

      const nodesRes = await nodeService.getTree(pathId);
      if (nodesRes.success) {
        setNodes(nodesRes.data);
      }

      if (isAuthenticated) {
        try {
          const progressRes = await progressService.getPathProgress(pathId);
          if (progressRes.success) {
            setProgress(progressRes.data);
          }
        } catch {
          console.log("İlerleme bulunamadı");
        }
      }
    } catch (error) {
      console.error("Veri yüklenirken hata:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartPath = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    try {
      const pathId = parseInt(id!);
      await progressService.startProgress(pathId);
      loadData();
    } catch (error) {
      console.error("İlerleme başlatılamadı:", error);
    }
  };

  const handleNodeClick = (nodeId: number, hasChildren: boolean) => {
    if (hasChildren) {
      toggleExpand(nodeId);
    } else {
      navigate(`/node/${nodeId}`);
    }
  };

  const toggleExpand = (nodeId: number) => {
    setExpandedNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const renderNodeTree = (nodes: Node[], level = 0) => {
    return nodes.map((node) => {
      const isCompleted = progress?.completedNodes?.includes(node.id);
      const hasChildren = node.children && node.children.length > 0;
      const isExpanded = expandedNodes.has(node.id);

      return (
        <div key={node.id} className="relative">
          {/* Connector Line for nested items (only if visible) */}
          {level > 0 && (
            <div
              className="absolute left-0 top-0 bottom-0 border-l-2 border-indigo-100 border-dashed"
              style={{ left: "-2px" }}
            />
          )}

          <div
            className={`
              relative mb-4 group transition-all duration-300
              ${level > 0 ? "ml-8" : ""}
            `}
          >
            {/* Timeline Horizontal Connector (tree branch) */}
            {level > 0 && (
              <div className="absolute -left-8 top-8 w-8 h-0.5 bg-indigo-100 border-t border-dashed border-indigo-200" />
            )}

            <div
              onClick={() => handleNodeClick(node.id, !!hasChildren)}
              className={`
                p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 relative overflow-hidden backdrop-blur-sm
                ${
                  isCompleted
                    ? "bg-green-50/50 border-green-200 hover:border-green-300 hover:shadow-green-100"
                    : "bg-white border-gray-100 hover:border-indigo-300 hover:shadow-indigo-100 hover:-translate-y-1"
                }
                shadow-sm
              `}
            >
              {/* Status Indicator Stripe */}
              <div
                className={`absolute top-0 bottom-0 left-0 w-1.5 transition-colors duration-300 ${
                  isCompleted
                    ? "bg-green-500"
                    : "bg-transparent group-hover:bg-indigo-500"
                }`}
              />

              <div className="flex items-center justify-between gap-4 pl-3">
                <div className="flex items-center gap-4">
                  <div
                    className={`
                      w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors
                      ${
                        isCompleted
                          ? "bg-green-100 text-green-600"
                          : "bg-gray-100 text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600"
                      }
                   `}
                  >
                    {hasChildren ? (
                      // Folder/Module Icon
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
                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                      </svg>
                    ) : isCompleted ? (
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
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                        <polyline points="10 9 9 9 8 9" />
                      </svg>
                    )}
                  </div>

                  <div>
                    <h4
                      className={`text-lg font-bold mb-1 transition-colors ${
                        isCompleted
                          ? "text-green-800"
                          : "text-gray-800 group-hover:text-indigo-700"
                      }`}
                    >
                      {node.title}
                    </h4>
                    {node.description && (
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {node.description}
                      </p>
                    )}
                  </div>
                </div>

                <div
                  className={`p-2 rounded-full transition-transform duration-300 group-hover:translate-x-1 ${
                    isCompleted
                      ? "text-green-500 bg-green-100/50"
                      : "text-gray-300 group-hover:text-indigo-500 bg-white shadow-sm border border-gray-100"
                  }`}
                >
                  {hasChildren ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-5 w-5 transition-transform duration-300 ${
                        isExpanded ? "rotate-90" : ""
                      }`}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  ) : (
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
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  )}
                </div>
              </div>
            </div>

            {/* Recursively render children ONLY if expanded */}
            {hasChildren && isExpanded && (
              <div className="mt-4 animate-in slide-in-from-top-2 duration-200">
                {renderNodeTree(node.children || [], level + 1)}
              </div>
            )}
          </div>
        </div>
      );
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Yükleniyor...</div>
      </div>
    );
  }

  if (!path) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-red-600">Eğitim bulunamadı</div>
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
          <div className="flex flex-col gap-4">
            {/* Top Row: Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate("/")}
                className="flex items-center gap-2 group text-gray-600 hover:text-indigo-600 transition-colors"
                title="Ana Sayfaya Dön"
              >
                <div className="w-10 h-10 rounded-xl bg-gray-100 group-hover:bg-indigo-50 border border-gray-200 group-hover:border-indigo-100 flex items-center justify-center transition-all">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 transition-transform group-hover:-translate-x-1"
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
                </div>
                <span className="font-medium hidden sm:inline">Ana Sayfa</span>
              </button>

              <div className="flex gap-2">
                {path.category && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium border border-indigo-100">
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
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                    </svg>
                    {path.category.name}
                  </span>
                )}
                {path.difficulty && (
                  <span
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${
                      path.difficulty === "BEGINNER"
                        ? "bg-green-50 text-green-700 border-green-100"
                        : path.difficulty === "INTERMEDIATE"
                        ? "bg-yellow-50 text-yellow-700 border-yellow-100"
                        : "bg-red-50 text-red-700 border-red-100"
                    }`}
                  >
                    {path.difficulty === "BEGINNER"
                      ? "Başlangıç"
                      : path.difficulty === "INTERMEDIATE"
                      ? "Orta"
                      : "İleri"}
                  </span>
                )}
              </div>
            </div>

            {/* Bottom Row: Title & Info */}
            <div className="pb-2">
              <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                {path.title}
              </h1>
              {path.description && (
                <p className="text-gray-600 mt-2 max-w-3xl leading-relaxed">
                  {path.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Progress Section */}
          {progress && (
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-indigo-50">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <span className="p-1.5 bg-indigo-100 rounded-lg text-indigo-600">
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
                  </span>
                  İlerleme Durumu
                </h2>
                <span className="text-2xl font-bold text-indigo-600">
                  %{progress.progressPercentage || 0}
                </span>
              </div>
              <div className="relative">
                <div className="overflow-hidden h-3 mb-2 text-xs flex rounded-full bg-indigo-100">
                  <div
                    style={{ width: `${progress.progressPercentage || 0}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-600 transition-all duration-500 ease-out"
                  ></div>
                </div>
                <div className="flex justify-between text-xs font-medium text-gray-500">
                  <span>Başlangıç</span>
                  <span>
                    {progress.completedNodesCount || 0} /{" "}
                    {progress.totalNodes || 0} Tamamlandı
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Start / Continue Action */}
          {!progress && isAuthenticated && nodes.length > 0 && (
            <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-8 shadow-xl shadow-indigo-200 text-white flex flex-col items-center text-center relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:bg-white/20 transition-all duration-700"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 group-hover:bg-black/20 transition-all duration-700"></div>

              <h2 className="text-3xl font-bold mb-4 relative z-10">
                Eğitim Yolculuğuna Başla!
              </h2>
              <p className="text-indigo-100 mb-8 max-w-lg relative z-10 text-lg">
                Bu eğitim seti ile kariyerinde yeni bir sayfa aç. Hazırsan hemen
                başlayalım.
              </p>
              <button
                onClick={handleStartPath}
                className="relative z-10 bg-white text-indigo-600 px-10 py-4 rounded-xl hover:bg-gray-50 transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 active:translate-y-0 flex items-center gap-2"
              >
                <span>Yolculuğa Başla</span>
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
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </div>
          )}

          {/* Content Tree */}
          <div className="bg-white/60 backdrop-blur-md rounded-2xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold mb-8 text-gray-900 flex items-center gap-2">
              <span className="p-2 bg-orange-100 rounded-lg text-orange-600">
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
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
              </span>
              İçerik Müfredatı
            </h2>

            {nodes.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <p className="text-gray-500 text-lg">
                  Henüz içerik eklenmemiş.
                </p>
              </div>
            ) : (
              <div className="space-y-4">{renderNodeTree(nodes)}</div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
