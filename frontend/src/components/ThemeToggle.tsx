import { useThemeStore } from "../store/themeStore";
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <button
      onClick={toggleTheme}
      className="p-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700 transition-all duration-200 shadow-sm border border-gray-200 dark:border-slate-700 active:scale-95"
      aria-label="Temayı Değiştir"
      title={theme === "light" ? "Karanlık Mod" : "Aydınlık Mod"}
    >
      {theme === "light" ? (
        <MoonIcon className="h-5 w-5" />
      ) : (
        <SunIcon className="h-5 w-5" />
      )}
    </button>
  );
}
