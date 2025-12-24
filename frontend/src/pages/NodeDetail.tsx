import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { nodeService } from "../services/nodeService";
import type { Node } from "../services/nodeService";
import { contentService } from "../services/contentService";
import type { Content } from "../services/contentService";
import { questionService } from "../services/questionService";
import type { CheckAnswerResponse } from "../services/questionService";
import { progressService } from "../services/progressService";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import type { SyntaxHighlighterProps } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function NodeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const [node, setNode] = useState<Node | null>(null);
  const [content, setContent] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);
  const [quizAnswers, setQuizAnswers] = useState<{ [key: number]: number }>({});
  const [quizResults, setQuizResults] = useState<{
    [key: number]: CheckAnswerResponse;
  }>({});

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const nodeId = parseInt(id!);

      const nodeRes = await nodeService.getById(nodeId);
      if (nodeRes.success) {
        setNode(nodeRes.data);

        if (nodeRes.data.contentId) {
          const contentRes = await contentService.getById(
            nodeRes.data.contentId
          );
          if (contentRes.success) {
            setContent(contentRes.data);
          }
        }
      }
    } catch (error) {
      console.error("Veri yüklenirken hata:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteNode = async () => {
    if (!isAuthenticated || !node) return;

    try {
      await progressService.completeNode(node.pathId, node.id);
      toast.success("Eğitim adımı tamamlandı!");
      navigate(`/path/${node.pathId}`);
    } catch (error) {
      console.error("Node tamamlanamadı:", error);
    }
  };

  const handleQuizAnswer = (questionId: number, answerIndex: number) => {
    setQuizAnswers({ ...quizAnswers, [questionId]: answerIndex });
  };

  const handleCheckAnswer = async (questionId: number) => {
    const userAnswer = quizAnswers[questionId];
    if (userAnswer === undefined) {
      toast.error("Lütfen bir cevap seçin.");
      return;
    }

    try {
      const result = await questionService.checkAnswer(questionId, userAnswer);
      if (result.success) {
        setQuizResults({ ...quizResults, [questionId]: result.data });
      }
    } catch (error) {
      console.error("Cevap kontrol edilemedi:", error);
    }
  };

  if (!isAuthenticated && !loading) {
    navigate("/login");
    return null;
  }

  if (loading && !node) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="container mx-auto max-w-4xl space-y-8">
          <div className="h-12 bg-white rounded-xl animate-pulse shadow-sm w-3/4"></div>
          <div className="h-64 bg-white rounded-2xl animate-pulse shadow-sm"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 animate-pulse rounded w-full"></div>
            <div className="h-4 bg-gray-200 animate-pulse rounded w-full"></div>
            <div className="h-4 bg-gray-200 animate-pulse rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!node) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="text-4xl">🔍</div>
        <div className="text-xl font-bold text-gray-800">İçerik bulunamadı</div>
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
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(`/path/${node?.pathId}`)}
                className="p-2.5 text-slate-400 hover:text-indigo-400 bg-slate-800 rounded-xl transition-all hover:bg-slate-700 group"
                aria-label="Eğitime Dön"
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
              <h1 className="text-xl font-bold text-slate-100 truncate max-w-xs md:max-w-md">
                {node?.title}
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={handleCompleteNode}
                className="hidden md:flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all font-semibold active:scale-95"
              >
                Tamamla ve Dön
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {content ? (
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-indigo-50 overflow-hidden">
            <div className="p-4 sm:p-10">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">
                {content.title}
              </h2>
              {node?.description && (
                <p className="text-slate-400 max-w-2xl">{node.description}</p>
              )}
            </div>

            {content.type === "VIDEO" && content.videoUrl && (
              <div className="relative mb-6">
                <div className="aspect-video bg-gray-900 overflow-hidden">
                  <iframe
                    src={content.videoUrl}
                    className="w-full h-full"
                    allowFullScreen
                  ></iframe>
                </div>
                {content.duration && (
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent pointer-events-none"></div>
                )}
              </div>
            )}

            {content.type === "ARTICLE" && content.articleText && (
              <div className="p-4 sm:p-10 pt-0">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({
                      className,
                      children,
                      ...props
                    }: React.ComponentPropsWithoutRef<"code">) {
                      const match = /language-(\w+)/.exec(className || "");
                      return match ? (
                        <SyntaxHighlighter
                          style={vscDarkPlus as SyntaxHighlighterProps["style"]}
                          language={match[1]}
                          PreTag="div"
                          className="rounded-xl overflow-hidden shadow-lg border border-slate-700/50 my-6"
                        >
                          {String(children).replace(/\n$/, "")}
                        </SyntaxHighlighter>
                      ) : (
                        <code
                          className={`${className} bg-slate-100 text-indigo-600 px-1.5 py-0.5 rounded-md text-[0.9em] font-semibold`}
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    },
                    h1: ({ children }) => (
                      <h1 className="text-3xl font-extrabold text-slate-900 mb-6">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-2xl font-bold text-slate-800 mt-10 mb-4 pb-2 border-b border-slate-100">
                        {children}
                      </h2>
                    ),
                    p: ({ children }) => (
                      <p className="leading-relaxed text-slate-600 mb-5">
                        {children}
                      </p>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc pl-6 space-y-2 mb-6 text-slate-600">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal pl-6 space-y-2 mb-6 text-slate-600">
                        {children}
                      </ol>
                    ),
                    a: ({ children, href }) => (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 font-medium underline decoration-indigo-200 hover:decoration-indigo-50 transition-all"
                      >
                        {children}
                      </a>
                    ),
                  }}
                >
                  {content.articleText}
                </ReactMarkdown>
              </div>
            )}

            {content.type === "QUIZ" &&
              content.questions &&
              content.questions.length > 0 && (
                <div className="p-4 sm:p-10 pt-0 space-y-6">
                  {content.questions.map((question, qIndex) => {
                    const result = quizResults[question.id];
                    const selectedAnswer = quizAnswers[question.id];

                    return (
                      <div
                        key={question.id}
                        className="border border-gray-100 bg-slate-50/50 rounded-2xl p-6"
                      >
                        <h3 className="font-bold text-lg mb-4 text-gray-900">
                          Soru {qIndex + 1}: {question.question}
                        </h3>

                        <div className="space-y-2 mb-4">
                          {question.options.map((option, index) => (
                            <label
                              key={index}
                              className={`flex items-center p-4 rounded-xl cursor-pointer transition-all border ${
                                result
                                  ? index === question.correctAnswer
                                    ? "bg-green-50 border-green-200 text-green-700"
                                    : index === selectedAnswer &&
                                      !result.isCorrect
                                    ? "bg-red-50 border-red-200 text-red-700"
                                    : "bg-white border-transparent text-gray-500"
                                  : selectedAnswer === index
                                  ? "bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm"
                                  : "bg-white border-gray-100 hover:border-indigo-100 text-gray-600"
                              }`}
                            >
                              <input
                                type="radio"
                                name={`question-${question.id}`}
                                value={index}
                                checked={selectedAnswer === index}
                                onChange={() =>
                                  handleQuizAnswer(question.id, index)
                                }
                                disabled={!!result}
                                className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500 mr-3"
                              />
                              <span className="font-medium">{option}</span>
                            </label>
                          ))}
                        </div>

                        {!result && (
                          <button
                            onClick={() => handleCheckAnswer(question.id)}
                            className="w-full sm:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-200 transition-all font-semibold active:scale-95"
                          >
                            Kontrol Et
                          </button>
                        )}

                        {result && (
                          <div
                            className={`p-4 rounded-xl border flex items-start gap-3 ${
                              result.isCorrect
                                ? "bg-green-50 border-green-100 text-green-800"
                                : "bg-red-50 border-red-100 text-red-800"
                            }`}
                          >
                            <span className="text-xl mt-0.5">
                              {result.isCorrect ? "✨" : "💡"}
                            </span>
                            <div>
                              <p className="font-bold mb-1">
                                {result.isCorrect
                                  ? "Harika! Doğru cevap."
                                  : "Üzgünüm, bu yanlış cevap."}
                              </p>
                              {result.explanation && (
                                <p className="text-sm opacity-90 leading-relaxed">
                                  {result.explanation}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-8 shadow-md mb-6 text-center">
            <p className="text-gray-500">
              Bu node için henüz içerik eklenmemiş.
            </p>
          </div>
        )}

        {isAuthenticated && (
          <div className="text-center">
            <button
              onClick={handleCompleteNode}
              className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition font-semibold text-lg"
            >
              ✓ Tamamla ve Devam Et
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
