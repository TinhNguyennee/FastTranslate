import { useState, useEffect, useRef } from "react";
import { 
  Lock, 
  Unlock, 
  Sun, 
  Moon, 
  Copy, 
  Check, 
  Trash2, 
  Sparkles, 
  Languages, 
  Globe,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const SAMPLE_TEXT = `Welcome to the Quick Translator Lockpad! 

Here is an example passage in English. You can replace this text with any foreign language you want to read and translate (such as English, Japanese, Chinese, or Korean).

Browsers (like Google Chrome, Safari, and Microsoft Edge) have a built-in feature to translate web pages instantly. However, they cannot translate text that is stored inside a <textarea> or typing input box. 

By clicking the "Khóa văn bản" (Lock Text) button below:
1. This typing area will transform into high-quality HTML paragraph (<p>) blocks.
2. You can then right-click anywhere on this page and choose "Translate to Tiếng Việt" (Dịch sang tiếng Việt) in your browser.
3. The translation engine will immediately translate all paragraphs flawlessly!
4. You can even click "Sao chép" (Copy) to copy the newly translated text!

Give it a try now! Click the Lock button below, right-click to translate, and see the magic happen dynamic and fast.`;

export default function App() {
  // Read theme from localStorage or system preference
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      if (saved) return saved === "dark";
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  // Main text state
  const [text, setText] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("lockpad_text") || "";
    }
    return "";
  });

  // State: is local state locked or in edit mode
  const [isLocked, setIsLocked] = useState<boolean>(false);

  // Copy success animation state
  const [copied, setCopied] = useState<boolean>(false);

  // Textarea reference to focus on edit toggle
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Copy timer ref
  const copyTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync theme to root class
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  // Persist text state
  useEffect(() => {
    localStorage.setItem("lockpad_text", text);
  }, [text]);

  const handleToggleTheme = () => {
    setIsDark(!isDark);
  };

  const handleLockToggle = () => {
    setIsLocked(true);
  };

  const handleUnlockToggle = () => {
    setIsLocked(false);
    // Focus the textarea after unlocking
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
  };

  const handleClear = () => {
    if (window.confirm("Bạn có tin chắc chắn muốn xóa toàn bộ văn bản hiện tại không?")) {
      setText("");
      setIsLocked(false);
    }
  };

  const handleLoadSample = () => {
    setText(SAMPLE_TEXT);
    setIsLocked(false);
  };

  const handleCopy = async () => {
    try {
      if (isLocked) {
        // If locked, we want to grab the currently rendered text from the HTML structure.
        // This is extremely important because if the user uses browser translation, 
        // the text in original state (react state) is still original language, but the DOM carries the translated text!
        // Copying from the DOM elements guarantees we copy the translated text.
        const outputElement = document.getElementById("translated-content-wrapper");
        if (outputElement) {
          const innerText = outputElement.innerText;
          await navigator.clipboard.writeText(innerText);
        } else {
          await navigator.clipboard.writeText(text);
        }
      } else {
        await navigator.clipboard.writeText(text);
      }
      setCopied(true);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Lỗi khi sao chép văn bản: ", err);
    }
  };

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  // Calculate text statistics
  const charCount = text.length;
  const wordCount = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
  const paragraphCount = text.trim() === "" ? 0 : text.split(/\n+/).filter(p => p.trim() !== "").length;

  return (
    <div id="app-container" className="min-h-screen transition-colors duration-300 bg-zinc-50 dark:bg-zinc-950 flex flex-col justify-between p-4 md:p-8 font-sans">
      {/* Upper Navigation and Header */}
      <header id="app-header" className="max-w-4xl w-full mx-auto flex items-center justify-between py-4 border-b border-zinc-200 dark:border-zinc-800">
        <div id="brand-container" className="flex items-center gap-3">
          <div id="logo-badge" className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
            <Languages size={22} id="logo-icon" />
          </div>
          <div>
            <h1 id="app-title" className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              Khóa Dịch Thuật
            </h1>
            <p id="app-subtitle" className="text-xs text-zinc-500 dark:text-zinc-400">
              Chuyển văn bản thành thẻ đọc để dịch bằng trình duyệt
            </p>
          </div>
        </div>

        {/* Action Controls top right */}
        <div id="header-actions" className="flex items-center gap-2">
          {/* Default Sample button when empty or just quick trial */}
          <button
            id="btn-sample"
            onClick={handleLoadSample}
            title="Tải văn bản mẫu"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900 transition-all border border-amber-200/50 dark:border-amber-900/50"
          >
            <Sparkles size={14} id="icon-sample" />
            <span>Mẫu tiếng Anh</span>
          </button>

          {/* Theme switcher */}
          <button
            id="btn-theme-toggle"
            onClick={handleToggleTheme}
            aria-label="Chuyển chế độ sáng tối"
            title={isDark ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối"}
            className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
          >
            {isDark ? <Sun size={18} id="icon-sun" /> : <Moon size={18} id="icon-moon" />}
          </button>
        </div>
      </header>

      {/* Main Focus Area */}
      <main id="main-content" className="flex-1 max-w-4xl w-full mx-auto flex flex-col justify-center my-6 md:my-10">
        <div id="content-card" className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl shadow-zinc-200/40 dark:shadow-none flex flex-col overflow-hidden transition-all duration-300">
          
          {/* Interactive Input/Output Stage */}
          <div id="display-container" className="flex-1 min-h-[350px] md:min-h-[420px] relative flex flex-col">
            <AnimatePresence mode="wait">
              {!isLocked ? (
                // Writing Mode
                <motion.div
                  key="edit-mode"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  id="editor-wrapper"
                  className="absolute inset-0 flex flex-col p-6"
                >
                  <label htmlFor="text-input" className="sr-only">Nội dung văn bản</label>
                  <textarea
                    id="text-input"
                    ref={textareaRef}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Hãy dán hoặc nhập nội dung văn bản tiếng nước ngoài của bạn ở đây... Ví dụ: sách báo tiếng Anh, tài liệu tiếng Trung, tiếng Nhật... sau đó nhấn nút 'Khóa văn bản' phía dưới."
                    className="w-full h-full flex-1 resize-none bg-transparent outline-none text-zinc-800 dark:text-zinc-200 text-base md:text-lg leading-relaxed placeholder-zinc-400 dark:placeholder-zinc-600"
                    autoFocus
                  />
                  {text.length === 0 && (
                    <div id="empty-state-tip" className="absolute left-6 right-6 top-1/2 -translate-y-1/2 pointer-events-none flex flex-col items-center text-center text-zinc-300 dark:text-zinc-700">
                      <Languages size={48} className="mb-4 text-zinc-200 dark:text-zinc-800 animate-pulse" id="icon-empty-state" />
                      <p className="text-sm">Chưa có văn bản nào được nhập</p>
                      <button 
                        id="btn-empty-sample"
                        onClick={handleLoadSample}
                        className="mt-3 pointer-events-auto px-4 py-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-semibold text-zinc-600 dark:text-zinc-300 transition-colors"
                      >
                        Thử dùng mẫu sẵn có
                      </button>
                    </div>
                  )}
                </motion.div>
              ) : (
                // Locked Reading/Translation Mode
                <motion.div
                  key="lock-mode"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  id="lock-wrapper"
                  className="absolute inset-0 flex flex-col p-6 overflow-y-auto"
                >
                  {/* Tip banner for translator lock mode */}
                  <div id="tip-banner" className="mb-4 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 text-xs flex items-start gap-2.5 border border-blue-100 dark:border-blue-900/30">
                    <Info size={16} className="mt-0.5 text-blue-500 shrink-0" id="icon-tip" />
                    <div>
                      <p className="font-semibold block mb-0.5">Văn bản đã được khóa thành định dạng HTML Paragraphs!</p>
                      <p>
                        Bây giờ hãy nhấp <strong>chuột phải vào đây</strong> và chọn <strong>"Dịch sang tiếng Việt"</strong> (hoặc bấm biểu tượng Dịch của trình duyệt ở góc thanh địa chỉ) để dịch nhanh toàn bộ nội dung.
                      </p>
                    </div>
                  </div>

                  {/* Render paragraphs cleanly for browsers to translate */}
                  <div
                    id="translated-content-wrapper"
                    className="flex-1 prose dark:prose-invert max-w-none text-zinc-800 dark:text-zinc-100 placeholder-ready selection:bg-amber-200 dark:selection:bg-amber-900/50"
                  >
                    {text.split(/\n+/).map((p, idx) => {
                      const trimmed = p.trim();
                      if (trimmed === "") return null;
                      return (
                        <p 
                          key={idx} 
                          id={`p-segment-${idx}`}
                          className="mb-4 whitespace-pre-wrap leading-relaxed text-base md:text-lg tracking-normal font-normal border-l-2 border-transparent hover:border-amber-400 pl-3 transition-colors duration-150"
                        >
                          {trimmed}
                        </p>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Stats indicator bar at Card bottom */}
          <div id="stats-panel" className="px-6 py-3 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-wrap items-center justify-between text-xs font-mono text-zinc-500 dark:text-zinc-400 gap-2">
            <div id="stat-counters" className="flex items-center gap-4">
              <span id="stat-words">Từ: <strong className="text-zinc-700 dark:text-zinc-200">{wordCount}</strong></span>
              <span id="stat-chars">Ký tự: <strong className="text-zinc-700 dark:text-zinc-200">{charCount}</strong></span>
              <span id="stat-paragraphs">Đoạn văn: <strong className="text-zinc-700 dark:text-zinc-200">{paragraphCount}</strong></span>
            </div>
            
            <div id="stat-status" className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isLocked ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} id="indicator-dot" />
              <span>{isLocked ? "Trạng thái: Đọc & Dịch" : "Trạng thái: Đang soạn thảo"}</span>
            </div>
          </div>

          {/* Core Controls Footer */}
          <div id="controls-footer" className="p-6 bg-zinc-50 dark:bg-zinc-900/80 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Left aligned utility functions */}
            <div id="utility-left" className="flex items-center gap-2 w-full sm:w-auto justify-start">
              <button
                id="btn-clear"
                disabled={!text}
                onClick={handleClear}
                title="Xóa toàn bộ nội dung"
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-40 disabled:hover:text-zinc-500 disabled:hover:bg-transparent"
              >
                <Trash2 size={16} id="icon-trash" />
                <span>Xóa sạch</span>
              </button>

              <button
                id="btn-copy"
                disabled={!text}
                onClick={handleCopy}
                title="Sao chép toàn bộ văn bản (bao gồm cả bản dịch từ trình duyệt nếu có)"
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-40"
              >
                {copied ? (
                  <>
                    <Check size={16} className="text-emerald-500" id="icon-check" />
                    <span className="text-emerald-500">Đã sao chép!</span>
                  </>
                ) : (
                  <>
                    <Copy size={16} id="icon-copy-normal" />
                    <span>Sao chép</span>
                  </>
                )}
              </button>
            </div>

            {/* Right aligned core state swappers */}
            <div id="actions-right" className="flex items-center gap-3 w-full sm:w-auto">
              {isLocked ? (
                <button
                  id="btn-unlock"
                  onClick={handleUnlockToggle}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold border-2 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition duration-150 active:scale-95 shadow-sm"
                >
                  <Unlock size={16} id="icon-unlock" />
                  <span>Sửa văn bản</span>
                </button>
              ) : (
                <button
                  id="btn-lock"
                  disabled={!text}
                  onClick={handleLockToggle}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold text-sm rounded-xl transition duration-150 active:scale-95 shadow-md shadow-amber-500/10 disabled:opacity-50 disabled:pointer-events-none"
                >
                  <Lock size={16} id="icon-lock-btn" />
                  <span>Khóa văn bản để Dịch</span>
                </button>
              )}
            </div>

          </div>

        </div>
      </main>

      {/* Elegant minimalist informational footer */}
      <footer id="developer-notices" className="text-center py-4 border-t border-zinc-200 dark:border-zinc-800 max-w-4xl w-full mx-auto">
        <div id="footer-row-1" className="flex items-center justify-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-500 font-medium">
          <Globe size={13} className="text-zinc-400 dark:text-zinc-600" id="globe-icon-footer" />
          <span>Hỗ trợ Google Translate, Edge Translate, Safari Translation và các tiện ích mở rộng dịch thuật trên trình duyệt.</span>
        </div>
        <p id="footer-row-2" className="text-[10px] text-zinc-300 dark:text-zinc-700 mt-1.5 font-mono">
          © {new Date().getFullYear()} Lock & Translate Pad • Tiện ích hỗ trợ dịch văn bản nguyên bản
        </p>
      </footer>
    </div>
  );
}
