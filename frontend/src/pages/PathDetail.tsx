import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { pathService } from "../services/pathService";
import type { LearningPath } from "../services/pathService";
import { nodeService } from "../services/nodeService";
import type { Node } from "../services/nodeService";
import { progressService } from "../services/progressService";
import type { UserProgress } from "../services/progressService";
import { useAuthStore } from "../store/authStore";
import { PathCardSkeleton } from "../components/Skeleton";

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
                    ? "bg-emerald-900/30 border-emerald-700 hover:border-emerald-600 hover:shadow-emerald-900/50"
                    : "card-hover hover:-translate-y-1"
                }
                shadow-sm
              `}
            >
              {/* Status Indicator Stripe */}
              <div
                className={`absolute top-0 bottom-0 left-0 w-1.5 transition-colors duration-300 ${
                  isCompleted
                    ? "bg-emerald-500"
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
                          ? "bg-emerald-900/50 text-emerald-300"
                          : "bg-slate-700 text-slate-400 group-hover:bg-indigo-900/50 group-hover:text-indigo-400"
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
                          ? "text-emerald-300"
                          : "text-slate-100 group-hover:text-indigo-400"
                      }`}
                    >
                      {node.title}
                    </h4>
                    {node.description && (
                      <p className="text-sm text-slate-400 line-clamp-2">
                        {node.description}
                      </p>
                    )}
                  </div>
                </div>

                <div
                  className={`p-2 rounded-full transition-transform duration-300 group-hover:translate-x-1 ${
                    isCompleted
                      ? "text-emerald-400 bg-emerald-900/30"
                      : "text-slate-500 group-hover:text-indigo-400 bg-slate-800 shadow-sm border border-slate-700"
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

  if (!isAuthenticated && !loading) {
    navigate("/login");
    return null;
  }

  if (loading && !path) {
    return (
      <div className="min-h-screen bg-slate-900 p-8">
        <div className="container mx-auto max-w-4xl">
          <PathCardSkeleton />
          <div className="mt-8 space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 bg-white/60 rounded-2xl animate-pulse border border-gray-100 shadow-sm"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!path) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="text-4xl">🔍</div>
        <div className="text-xl font-bold text-gray-800">Eğitim bulunamadı</div>
        <button
          onClick={() => navigate("/")}
          className="bg-indigo-600 text-white px-6 py-2 rounded-xl"
        >
          Ana Sayfaya Dön
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 relative selection:bg-indigo-600 selection:text-white">
      {/* Background patterns */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
      </div>

      <header className="nav-header">
        <div className="container mx-auto px-6 py-3">
          <div className="flex flex-col gap-3">
            {/* Top Row */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate("/")}
                  className="p-2.5 text-slate-400 hover:text-indigo-400 bg-slate-800 rounded-xl transition-all hover:bg-slate-700 group"
                  aria-label="Geri Dön"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 group-hover:-translate-x-1 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <div className="h-6 w-px bg-slate-700 mx-1"></div>
              </div>

              <div className="flex items-center gap-4">
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
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Course Hero & Action Section */}
          <div
            className={`${
              progress
                ? "card"
                : "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-xl shadow-indigo-900/50"
            } rounded-2xl p-8 relative overflow-hidden group`}
          >
            {!progress && (
              <>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:bg-white/20 transition-all duration-700"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 group-hover:bg-black/20 transition-all duration-700"></div>
              </>
            )}

            <div className="relative z-10">
              <h1
                className={`text-3xl md:text-4xl font-bold mb-4 leading-tight ${
                  progress ? "text-slate-100" : "text-white"
                }`}
              >
                {path.title}
              </h1>

              {path.description && (
                <p
                  className={`text-lg mb-8 max-w-3xl leading-relaxed ${
                    progress ? "text-slate-400" : "text-indigo-100"
                  }`}
                >
                  {path.description}
                </p>
              )}

              {!progress && isAuthenticated && nodes.length > 0 && (
                <button
                  onClick={handleStartPath}
                  className="bg-white text-indigo-600 px-10 py-4 rounded-xl hover:bg-gray-50 transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 active:translate-y-0 flex items-center gap-2 w-fit"
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
              )}
            </div>
          </div>

          {/* Progress Section */}
          {progress && (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
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

          {/* Content Tree */}
          <div className="card">
            <h2 className="text-2xl font-bold mb-8 text-slate-100 flex items-center gap-2">
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
