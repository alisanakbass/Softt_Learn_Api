import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { contentService, type ContentType } from "../services/contentService";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { AxiosError } from "axios";
import type { CreateContentData } from "../services/contentService";

interface ContentEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentId?: number; // Varsa düzenleme, yoksa oluşturma (node üzerinden)
  onSuccess: (contentId: number) => void;
}

export default function ContentEditorModal({
  isOpen,
  onClose,
  contentId,
  onSuccess,
}: ContentEditorModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<{
    type: ContentType;
    title: string;
    description: string;
    videoUrl: string;
    duration: number;
    articleText: string;
    questions: Array<{
      question: string;
      options: string[];
      correctAnswer: number;
      explanation: string;
    }>;
  }>({
    type: "VIDEO",
    title: "",
    description: "",
    videoUrl: "",
    duration: 0,
    articleText: "",
    questions: [],
  });
  const [questionToRemove, setQuestionToRemove] = useState<number | null>(null);

  const loadContent = useCallback(async () => {
    if (!contentId) return;
    try {
      setLoading(true);
      const res = await contentService.getById(contentId);
      if (res.success) {
        setFormData({
          type: res.data.type,
          title: res.data.title,
          description: res.data.description || "",
          videoUrl: res.data.videoUrl || "",
          duration: res.data.duration || 0,
          articleText: res.data.articleText || "",
          questions:
            res.data.questions?.map((q) => ({
              question: q.question,
              options: q.options,
              correctAnswer: q.correctAnswer,
              explanation: q.explanation || "",
            })) || [],
        });
      }
    } catch (error) {
      console.error("İçerik yüklenirken hata:", error);
    } finally {
      setLoading(false);
    }
  }, [contentId]);

  useEffect(() => {
    if (isOpen && contentId) {
      loadContent();
    } else if (isOpen) {
      // Reset form for new content
      setFormData({
        type: "VIDEO",
        title: "",
        description: "",
        videoUrl: "",
        duration: 0,
        articleText: "",
        questions: [],
      });
    }
  }, [isOpen, contentId, loadContent]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);

      // Temel validation
      if (formData.type === "VIDEO" && !formData.videoUrl) {
        toast.error("Lütfen video URL giriniz");
        return;
      }
      if (formData.type === "ARTICLE" && !formData.articleText) {
        toast.error("Lütfen makale içeriği giriniz");
        return;
      }

      let result;
      // Gönderilecek veriyi temizle (Zod validation hatası almamak için)
      const cleanData: CreateContentData = {
        type: formData.type,
        title: formData.title,
        description: formData.description,
      };

      if (formData.type === "VIDEO") {
        cleanData.videoUrl = formData.videoUrl;
        cleanData.duration = formData.duration;
      } else if (formData.type === "ARTICLE") {
        cleanData.articleText = formData.articleText;
      } else if (formData.type === "QUIZ") {
        cleanData.questions = formData.questions;
      }

      if (contentId) {
        // Update existing content
        result = await contentService.update(contentId, cleanData);
      } else {
        // Create new content
        result = await contentService.create(cleanData);
      }

      if (result.success) {
        toast.success("İçerik başarıyla kaydedildi!");
        onSuccess(result.data.id);
        onClose();
      } else {
        toast.error("İçerik kaydedilemedi");
      }
    } catch (error: unknown) {
      console.error("Kaydetme hatası:", error);
      let msg = "İçerik kaydedilemedi.";
      if (error instanceof AxiosError) {
        msg = error.response?.data?.message || msg;
      }
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Quiz Helpers
  const addQuestion = () => {
    setFormData({
      ...formData,
      questions: [
        ...formData.questions,
        {
          question: "",
          options: ["", "", "", ""],
          correctAnswer: 0,
          explanation: "",
        },
      ],
    });
  };

  const updateQuestion = (
    index: number,
    field: "question" | "correctAnswer" | "explanation",
    value: string | number
  ) => {
    const newQuestions = [...formData.questions];
    if (field === "question") {
      newQuestions[index].question = value as string;
    } else if (field === "correctAnswer") {
      newQuestions[index].correctAnswer = value as number;
    } else if (field === "explanation") {
      newQuestions[index].explanation = value as string;
    }
    setFormData({ ...formData, questions: newQuestions });
  };

  const updateOption = (qIndex: number, oIndex: number, value: string) => {
    const newQuestions = [...formData.questions];
    newQuestions[qIndex].options[oIndex] = value;
    setFormData({ ...formData, questions: newQuestions });
  };

  const removeQuestion = (index: number) => {
    setQuestionToRemove(index);
  };

  const confirmRemoveQuestion = () => {
    if (questionToRemove === null) return;
    const newQuestions = formData.questions.filter(
      (_, i) => i !== questionToRemove
    );
    setFormData({ ...formData, questions: newQuestions });
    setQuestionToRemove(null);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      style={{ zIndex: 9999 }}
    >
      <div
        className={`bg-white dark:bg-slate-900 rounded-2xl shadow-2xl flex flex-col w-full max-h-[95vh] border border-gray-100 dark:border-slate-800 ${
          formData.type === "ARTICLE" ? "max-w-6xl" : "max-w-2xl"
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-800">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {contentId ? "İçeriği Düzenle" : "Yeni İçerik Oluştur"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Tip Seçimi */}
            {!contentId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  İçerik Tipi
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value as ContentType,
                    })
                  }
                  className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-gray-900 dark:text-gray-100"
                >
                  <option value="VIDEO">Video</option>
                  <option value="ARTICLE">Makale</option>
                  <option value="QUIZ">Quiz / Test</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Başlık
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-gray-900 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Açıklama
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-gray-900 dark:text-gray-100"
                rows={2}
              />
            </div>

            {/* Type Specific Fields */}
            {formData.type === "VIDEO" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Video URL (MP4)
                  </label>
                  <input
                    type="text"
                    value={formData.videoUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, videoUrl: e.target.value })
                    }
                    className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-gray-900 dark:text-gray-100"
                    placeholder="https://example.com/video.mp4"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Süre (Saniye)
                  </label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        duration: parseInt(e.target.value),
                      })
                    }
                    className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-gray-900 dark:text-gray-100"
                  />
                </div>
              </>
            )}

            {formData.type === "ARTICLE" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[500px]">
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
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
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Makale İçeriği (Markdown)
                  </label>
                  <textarea
                    value={formData.articleText}
                    onChange={(e) =>
                      setFormData({ ...formData, articleText: e.target.value })
                    }
                    className="flex-1 w-full p-4 border border-gray-200 dark:border-slate-700 rounded-xl font-mono text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none bg-slate-50 dark:bg-slate-800/50 text-gray-900 dark:text-gray-100"
                    placeholder="# Başlık&#10;Metin buraya..."
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
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
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    Canlı Önizleme
                  </label>
                  <div className="flex-1 w-full p-6 border border-gray-100 dark:border-slate-800 rounded-xl prose dark:prose-invert prose-indigo max-w-none overflow-y-auto bg-white dark:bg-slate-800/30 prose-pre:bg-transparent prose-pre:p-0">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code({
                          className,
                          children,
                          ...props
                        }: React.HTMLProps<HTMLElement>) {
                          const match = /language-(\w+)/.exec(className || "");
                          return match ? (
                            <SyntaxHighlighter
                              style={vscDarkPlus}
                              language={match[1]}
                              PreTag="div"
                              className="rounded-lg my-4"
                            >
                              {String(children).replace(/\n$/, "")}
                            </SyntaxHighlighter>
                          ) : (
                            <code
                              className="bg-slate-100 dark:bg-slate-700 px-1 rounded text-indigo-600 dark:text-indigo-400"
                              {...props}
                            >
                              {children}
                            </code>
                          );
                        },
                      }}
                    >
                      {formData.articleText || "*Henüz içerik girilmedi...*"}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            )}

            {formData.type === "QUIZ" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">
                    Sorular
                  </h3>
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                  >
                    + Soru Ekle
                  </button>
                </div>

                {formData.questions.map((q, qIndex) => (
                  <div
                    key={qIndex}
                    className="border border-gray-200 dark:border-slate-700 p-4 rounded-lg bg-gray-50 dark:bg-slate-800/40"
                  >
                    <div className="flex justify-between mb-2">
                      <label className="font-medium text-gray-900 dark:text-gray-100">
                        Soru {qIndex + 1}
                      </label>
                      <button
                        type="button"
                        onClick={() => removeQuestion(qIndex)}
                        className="text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors font-medium"
                      >
                        Sil
                      </button>
                    </div>
                    <input
                      type="text"
                      value={q.question}
                      onChange={(e) =>
                        updateQuestion(qIndex, "question", e.target.value)
                      }
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl mb-2 text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-indigo-500/20"
                      placeholder="Soru metni..."
                    />

                    <div className="grid grid-cols-2 gap-2 mb-2">
                      {q.options.map((opt, oIndex) => (
                        <div key={oIndex} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`correct-${qIndex}`}
                            checked={q.correctAnswer === oIndex}
                            onChange={() =>
                              updateQuestion(qIndex, "correctAnswer", oIndex)
                            }
                          />
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) =>
                              updateOption(qIndex, oIndex, e.target.value)
                            }
                            className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-indigo-500/20"
                            placeholder={`Seçenek ${oIndex + 1}`}
                          />
                        </div>
                      ))}
                    </div>

                    <input
                      type="text"
                      value={q.explanation}
                      onChange={(e) =>
                        updateQuestion(qIndex, "explanation", e.target.value)
                      }
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-indigo-500/20"
                      placeholder="Cevap açıklaması (opsiyonel)"
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-3 justify-end mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl font-semibold transition-all border border-gray-300 dark:border-slate-700"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 font-semibold shadow-lg shadow-indigo-900/50 hover:shadow-xl hover:shadow-indigo-900/60 transition-all active:scale-95"
              >
                {loading ? "Kaydediliyor..." : "Kaydet"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Question Remove Confirmation Modal */}
      {questionToRemove !== null && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{ zIndex: 10000 }}
        >
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"></div>
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 p-6 max-w-sm w-full animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center flex-shrink-0">
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
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  Soruyu Sil
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Bu soruyu listeden kaldırmak istediğinize emin misiniz?
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setQuestionToRemove(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={confirmRemoveQuestion}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 shadow-lg shadow-red-200 dark:shadow-red-900/20 transition-all"
              >
                Evet, Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
