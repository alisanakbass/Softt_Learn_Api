import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { userService, type User } from "../services/userService";
import { useAuthStore } from "../store/authStore";
import { AxiosError } from "axios";
import toast from "react-hot-toast";

interface UserFormData extends Partial<User> {
  password?: string;
}

export default function UserManagement() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedUser, setSelectedUser] = useState<UserFormData>({});
  const [modalLoading, setModalLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [roleChangePending, setRoleChangePending] = useState<{
    userId: number;
    newRole: string;
  } | null>(null);

  // Load data function
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await userService.getAll(page, 10);
      setUsers(res.data.items);
      setTotalPages(res.data.meta.totalPages);
    } catch (err) {
      console.error(err);
      setError("Kullanıcılar yüklenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRoleChange = (userId: number, newRole: string) => {
    setRoleChangePending({ userId, newRole });
  };

  const confirmRoleChange = async () => {
    if (!roleChangePending) return;
    const { userId, newRole } = roleChangePending;
    try {
      await userService.updateRole(userId, newRole);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, role: newRole as User["role"] } : u
        )
      );
      setRoleChangePending(null);
      toast.success("Kullanıcı rolü başarıyla güncellendi.");
    } catch (err) {
      console.error(err);
      toast.error("Rol güncellenirken hata oluştu");
    }
  };

  const handleDeleteClick = (userId: number) => {
    setDeleteId(userId);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await userService.delete(deleteId);
      setUsers((prev) => prev.filter((u) => u.id !== deleteId));
      setDeleteId(null);
      toast.success("Kullanıcı başarıyla silindi.");
    } catch (err: unknown) {
      console.error(err);
      let errorMessage = "Kullanıcı silinirken hata oluştu";
      if (err instanceof AxiosError) {
        errorMessage = err.response?.data?.message || errorMessage;
      }
      toast.error(errorMessage);
    }
  };

  const openCreateModal = () => {
    setModalMode("create");
    setSelectedUser({ role: "STUDENT" });
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setModalMode("edit");
    setSelectedUser({ ...user, password: "" }); // password placeholder
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      if (modalMode === "create") {
        await userService.create(selectedUser);
        toast.success("Yeni kullanıcı başarıyla eklendi.");
      } else {
        const dataToUpdate = { ...selectedUser };
        // Clean up empty password for edit mode
        if (!dataToUpdate.password) {
          delete dataToUpdate.password;
        }
        await userService.update(selectedUser.id!, dataToUpdate);
        toast.success("Kullanıcı başarıyla güncellendi.");
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: unknown) {
      console.error(err);
      let errorMessage = "İşlem sırasında hata oluştu";
      if (err instanceof AxiosError) {
        errorMessage = err.response?.data?.message || errorMessage;
      }
      toast.error(errorMessage);
    } finally {
      setModalLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 relative selection:bg-indigo-600 selection:text-white">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      <header className="nav-header">
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
            {/* Brand Section */}
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
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-100 tracking-tight group-hover:text-indigo-400 transition-colors">
                  Kullanıcı Yönetimi
                </h1>
                <p
                  onClick={() => navigate("/profile")}
                  className="text-xs font-bold text-indigo-500 uppercase tracking-wider hover:text-indigo-700 cursor-pointer transition-colors"
                >
                  Yetkilendirme Paneli
                </p>
              </div>
            </div>

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

              <button
                onClick={() => navigate("/dashboard")}
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
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                  </svg>
                </span>
                <span className="hidden sm:inline">Dashboard</span>
              </button>

              <button
                onClick={handleLogout}
                className="ml-1 p-2.5 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded-xl transition-all duration-200"
                title="Çıkış Yap"
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
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-100">
              Tüm Kullanıcılar
            </h2>
            <p className="text-sm text-slate-400">
              Sistemdeki tüm kayıtlı kullanıcıları buradan yönetebilirsiniz.
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 active:scale-95 transition-all duration-200 font-semibold shadow-md shadow-indigo-100"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="8.5" cy="7" r="4" />
              <line x1="20" y1="8" x2="20" y2="14" />
              <line x1="23" y1="11" x2="17" y2="11" />
            </svg>
            <span>Yeni Kullanıcı Ekle</span>
          </button>
        </div>

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-700">
              <thead className="bg-slate-800/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    İsim
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {loading && users.length === 0
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-4 bg-gray-200 rounded w-8"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-4 bg-gray-200 rounded w-24"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-4 bg-gray-200 rounded w-48"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-8 bg-gray-100 rounded w-20"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-4 bg-gray-100 rounded w-16"></div>
                        </td>
                      </tr>
                    ))
                  : users.map((u) => (
                      <tr
                        key={u.id}
                        className="hover:bg-slate-800/50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                          #{u.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-100">
                          {u.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-slate-300">
                          {u.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={u.role}
                            onChange={(e) =>
                              handleRoleChange(u.id, e.target.value)
                            }
                            className={`block w-full py-2 px-3 border border-slate-600 bg-slate-800 text-slate-100 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-medium transition-all
                                ${
                                  u.role === "ADMIN"
                                    ? "text-purple-400 font-bold"
                                    : ""
                                }
                                ${
                                  u.role === "TEACHER"
                                    ? "text-blue-400 font-semibold"
                                    : ""
                                }
                            `}
                          >
                            <option value="STUDENT">Öğrenci</option>
                            <option value="TEACHER">Eğitmen</option>
                            <option value="ADMIN">Yönetici</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold space-x-3">
                          <button
                            onClick={() => openEditModal(u)}
                            className="text-indigo-400 hover:text-indigo-300 transition-colors"
                          >
                            Düzenle
                          </button>
                          <button
                            onClick={() => handleDeleteClick(u.id)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            Sil
                          </button>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-slate-800/50 px-4 py-3 border-t border-slate-700 flex items-center justify-between sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-slate-600 text-sm font-medium rounded-xl text-slate-200 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 transition-colors"
              >
                Önceki
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-slate-600 text-sm font-medium rounded-xl text-slate-200 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 transition-colors"
              >
                Sonraki
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-slate-300">
                  Toplam{" "}
                  <span className="font-semibold text-slate-100">
                    {totalPages}
                  </span>{" "}
                  sayfa
                </p>
              </div>
              <div>
                <nav
                  className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                  aria-label="Pagination"
                >
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="relative inline-flex items-center px-3 py-2 rounded-l-xl border border-slate-600 bg-slate-800 text-sm font-medium text-slate-300 hover:bg-slate-700 disabled:opacity-50 transition-colors"
                  >
                    <span className="sr-only">Önceki</span>
                    &larr;
                  </button>
                  <span className="relative inline-flex items-center px-4 py-2 border-t border-b border-slate-600 bg-slate-800 text-sm font-semibold text-slate-100">
                    {page}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="relative inline-flex items-center px-3 py-2 rounded-r-xl border border-slate-600 bg-slate-800 text-sm font-medium text-slate-300 hover:bg-slate-700 disabled:opacity-50 transition-colors"
                  >
                    <span className="sr-only">Sonraki</span>
                    &rarr;
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 overflow-y-auto" style={{ zIndex: 9999 }}>
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
              <form onSubmit={handleModalSubmit}>
                <div className="bg-slate-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg leading-6 font-bold text-slate-100 mb-4">
                    {modalMode === "create"
                      ? "Yeni Kullanıcı Ekle"
                      : "Kullanıcı Düzenle"}
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-300 mb-2 ml-1">
                        İsim
                      </label>
                      <input
                        type="text"
                        required
                        value={selectedUser.name || ""}
                        onChange={(e) =>
                          setSelectedUser({
                            ...selectedUser,
                            name: e.target.value,
                          })
                        }
                        className="block w-full border border-slate-600 bg-slate-900 text-slate-100 rounded-xl shadow-sm py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all placeholder:text-slate-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-300 mb-2 ml-1">
                        Email
                      </label>
                      <input
                        type="email"
                        required
                        value={selectedUser.email || ""}
                        onChange={(e) =>
                          setSelectedUser({
                            ...selectedUser,
                            email: e.target.value,
                          })
                        }
                        className="block w-full border border-slate-600 bg-slate-900 text-slate-100 rounded-xl shadow-sm py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all placeholder:text-slate-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-300 mb-2 ml-1">
                        Şifre
                        {modalMode === "edit" && (
                          <span className="text-xs text-slate-500 ml-2 font-normal">
                            (Değiştirmek istemiyorsanız boş bırakın)
                          </span>
                        )}
                      </label>
                      <input
                        type="password"
                        required={modalMode === "create"}
                        value={selectedUser.password || ""}
                        onChange={(e) =>
                          setSelectedUser({
                            ...selectedUser,
                            password: e.target.value,
                          })
                        }
                        className="block w-full border border-slate-600 bg-slate-900 text-slate-100 rounded-xl shadow-sm py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all placeholder:text-slate-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-300 mb-2 ml-1">
                        Rol
                      </label>
                      <select
                        value={selectedUser.role || "STUDENT"}
                        onChange={(e) =>
                          setSelectedUser({
                            ...selectedUser,
                            role: e.target.value as User["role"],
                          })
                        }
                        className="block w-full border border-slate-600 bg-slate-900 text-slate-100 rounded-xl shadow-sm py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all"
                      >
                        <option value="STUDENT">Öğrenci</option>
                        <option value="TEACHER">Eğitmen</option>
                        <option value="ADMIN">Yönetici</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-900/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-2">
                  <button
                    type="submit"
                    disabled={modalLoading}
                    className="w-full inline-flex justify-center rounded-xl border border-transparent shadow-lg px-5 py-2.5 bg-indigo-600 text-base font-semibold text-white hover:bg-indigo-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm shadow-indigo-900/50 hover:shadow-xl hover:shadow-indigo-900/60 transition-all duration-200 active:scale-95 disabled:opacity-50"
                  >
                    {modalLoading ? "Kaydediliyor..." : "Kaydet"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-xl border border-slate-700 shadow-sm px-5 py-2.5 bg-slate-800 text-base font-semibold text-slate-300 hover:bg-slate-700 hover:border-slate-600 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-all duration-200"
                  >
                    İptal
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {deleteId && (
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
                      aria-hidden="true"
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
                    <h3
                      className="text-lg leading-6 font-bold text-slate-100"
                      id="modal-title"
                    >
                      Kullanıcıyı Sil
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-slate-400">
                        Bu kullanıcıyı silmek istediğinize emin misiniz? Bu
                        işlem geri alınamaz ve kullanıcıya ait tüm veriler
                        silinecektir.
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
                  onClick={() => setDeleteId(null)}
                  className="mt-3 w-full inline-flex justify-center rounded-xl border border-slate-700 shadow-sm px-5 py-2.5 bg-slate-800 text-base font-semibold text-slate-300 hover:bg-slate-700 hover:border-slate-600 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-all duration-200"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Role Change Confirmation Modal */}
      {roleChangePending && (
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
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-900/30 border border-indigo-800 sm:mx-0 sm:h-10 sm:w-10">
                    <svg
                      className="h-6 w-6 text-indigo-400"
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
                      Rolü Değiştir
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-slate-400">
                        Kullanıcının yetki seviyesini değiştirmek istediğinize
                        emin misiniz? Bu işlem kullanıcının sistemdeki erişim
                        haklarını etkileyecektir.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-slate-900/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-2">
                <button
                  type="button"
                  onClick={confirmRoleChange}
                  className="w-full inline-flex justify-center rounded-xl border border-transparent shadow-lg px-5 py-2.5 bg-indigo-600 text-base font-semibold text-white hover:bg-indigo-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm shadow-indigo-900/50 hover:shadow-xl hover:shadow-indigo-900/60 transition-all duration-200 active:scale-95"
                >
                  Evet, Değiştir
                </button>
                <button
                  type="button"
                  onClick={() => setRoleChangePending(null)}
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
