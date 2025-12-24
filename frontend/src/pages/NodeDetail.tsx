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
      alert("✅ Tamamlandı!");
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
      alert("Lütfen bir cevap seçin");
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Yükleniyor...</div>
      </div>
    );
  }

  if (!node) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-red-600">İçerik bulunamadı</div>
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
            <button
              onClick={() => navigate(`/path/${node.pathId}`)}
              className="flex items-center gap-2 group w-fit text-gray-600 hover:text-indigo-600 transition-colors"
              title="Öğrenme Yoluna Geri Dön"
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
              <span className="font-medium hidden sm:inline">Geri Dön</span>
            </button>

            <div className="pb-2">
              <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                {node.title}
              </h1>
              {node.description && (
                <p className="text-gray-600 mt-2 max-w-3xl leading-relaxed">
                  {node.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {content ? (
          <div className="bg-white rounded-xl p-8 shadow-md mb-6">
            <h2 className="text-2xl font-bold mb-4">{content.title}</h2>
            {content.description && (
              <p className="text-gray-600 mb-6">{content.description}</p>
            )}

            {content.type === "VIDEO" && content.videoUrl && (
              <div className="mb-6">
                <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
                  <iframe
                    src={content.videoUrl}
                    className="w-full h-full"
                    allowFullScreen
                  ></iframe>
                </div>
                {content.duration && (
                  <p className="text-sm text-gray-500 mt-2">
                    ⏱️ Süre: {Math.floor(content.duration / 60)} dakika
                  </p>
                )}
              </div>
            )}

            {content.type === "ARTICLE" && content.articleText && (
              <div className="prose max-w-none mb-6">
                <div className="whitespace-pre-wrap">{content.articleText}</div>
              </div>
            )}

            {content.type === "QUIZ" &&
              content.questions &&
              content.questions.length > 0 && (
                <div className="space-y-6">
                  {content.questions.map((question, qIndex) => {
                    const result = quizResults[question.id];
                    const selectedAnswer = quizAnswers[question.id];

                    return (
                      <div
                        key={question.id}
                        className="border-2 border-gray-200 rounded-lg p-6"
                      >
                        <h3 className="font-bold text-lg mb-4">
                          Soru {qIndex + 1}: {question.question}
                        </h3>

                        <div className="space-y-2 mb-4">
                          {question.options.map((option, index) => (
                            <label
                              key={index}
                              className={`flex items-center p-3 rounded-lg cursor-pointer transition ${
                                result
                                  ? index === question.correctAnswer
                                    ? "bg-green-100 border-2 border-green-500"
                                    : index === selectedAnswer &&
                                      !result.isCorrect
                                    ? "bg-red-100 border-2 border-red-500"
                                    : "bg-gray-50"
                                  : selectedAnswer === index
                                  ? "bg-indigo-100 border-2 border-indigo-500"
                                  : "bg-gray-50 hover:bg-gray-100"
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
                                className="mr-3"
                              />
                              <span>{option}</span>
                            </label>
                          ))}
                        </div>

                        {!result && (
                          <button
                            onClick={() => handleCheckAnswer(question.id)}
                            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
                          >
                            Kontrol Et
                          </button>
                        )}

                        {result && (
                          <div
                            className={`p-4 rounded-lg ${
                              result.isCorrect ? "bg-green-50" : "bg-red-50"
                            }`}
                          >
                            <p className="font-bold mb-2">
                              {result.isCorrect ? "✅ Doğru!" : "❌ Yanlış!"}
                            </p>
                            {result.explanation && (
                              <p className="text-sm text-gray-700">
                                {result.explanation}
                              </p>
                            )}
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
