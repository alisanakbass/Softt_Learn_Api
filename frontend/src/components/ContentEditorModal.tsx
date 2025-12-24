import { useState, useEffect, useCallback } from "react";
import { contentService, type ContentType } from "../services/contentService";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);

      // Temel validation
      if (formData.type === "VIDEO" && !formData.videoUrl) {
        alert("Lütfen video URL giriniz");
        return;
      }
      if (formData.type === "ARTICLE" && !formData.articleText) {
        alert("Lütfen makale içeriği giriniz");
        return;
      }

      let result;
      if (contentId) {
        // Update existing content
        result = await contentService.update(contentId, formData);
      } else {
        // Create new content (Not mostly used directly from here in current flow but kept for safety)
        result = await contentService.create(formData);
      }

      if (result.success) {
        onSuccess(result.data.id);
        onClose();
      }
    } catch (error) {
      console.error("Kaydetme hatası:", error);
      alert("Bir hata oluştu");
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
    const newQuestions = formData.questions.filter((_, i) => i !== index);
    setFormData({ ...formData, questions: newQuestions });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">
          {contentId ? "İçeriği Düzenle" : "Yeni İçerik"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tip Seçimi */}
          {!contentId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="VIDEO">Video</option>
                <option value="ARTICLE">Makale</option>
                <option value="QUIZ">Quiz / Test</option>
              </select>
            </div>
          )}

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
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Açıklama
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-4 py-2 border rounded-lg"
              rows={2}
            />
          </div>

          {/* Type Specific Fields */}
          {formData.type === "VIDEO" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Video URL (MP4)
                </label>
                <input
                  type="url"
                  value={formData.videoUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, videoUrl: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="https://example.com/video.mp4"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
            </>
          )}

          {formData.type === "ARTICLE" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Makale İçeriği (Markdown)
              </label>
              <textarea
                value={formData.articleText}
                onChange={(e) =>
                  setFormData({ ...formData, articleText: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg font-mono text-sm"
                rows={10}
              />
            </div>
          )}

          {formData.type === "QUIZ" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg">Sorular</h3>
                <button
                  type="button"
                  onClick={addQuestion}
                  className="text-indigo-600 font-medium"
                >
                  + Soru Ekle
                </button>
              </div>

              {formData.questions.map((q, qIndex) => (
                <div key={qIndex} className="border p-4 rounded-lg bg-gray-50">
                  <div className="flex justify-between mb-2">
                    <label className="font-medium">Soru {qIndex + 1}</label>
                    <button
                      type="button"
                      onClick={() => removeQuestion(qIndex)}
                      className="text-red-500"
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
                    className="w-full px-3 py-2 border rounded mb-2"
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
                          className="w-full px-2 py-1 border rounded text-sm"
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
                    className="w-full px-3 py-2 border rounded text-sm"
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
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? "Kaydediliyor..." : "Kaydet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
