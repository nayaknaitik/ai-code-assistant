import { useState, useCallback, useEffect } from "react";
import { nanoid } from "nanoid";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { api } from "../lib/api";
import CodeEditor from "../components/CodeEditor";
import DiffView from "../components/DiffView";
import FileTabs from "../components/FileTabs";
import AIPanel from "../components/AIPanel";
import FileSidebar from "../components/FileSidebar";
import { DEFAULT_FILE, LANGUAGES } from "../lib/constants";

function getInitialFiles() {
  return [{ ...DEFAULT_FILE, id: nanoid(), remoteId: null }];
}

export default function EditorPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [files, setFiles] = useState(getInitialFiles);
  const [activeId, setActiveId] = useState(files[0]?.id);
  const [diff, setDiff] = useState(null);
  const [savedFiles, setSavedFiles] = useState([]);
  const activeFile = files.find((f) => f.id === activeId);

  const updateFile = useCallback((id, updates) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates } : f))
    );
  }, []);

  const addFile = useCallback(() => {
    const newFile = {
      id: nanoid(),
      name: "Untitled",
      language: "javascript",
      content: "",
      remoteId: null,
    };
    setFiles((prev) => [...prev, newFile]);
    setActiveId(newFile.id);
  }, []);

  const closeFile = useCallback((id) => {
    setFiles((prev) => {
      const next = prev.filter((f) => f.id !== id);
      if (activeId === id && next.length) {
        const idx = prev.findIndex((f) => f.id === id);
        setActiveId(next[Math.min(idx, next.length - 1)]?.id);
      } else if (next.length === 0) {
        const defaultNew = { ...DEFAULT_FILE, id: nanoid() };
        setFiles([defaultNew]);
        setActiveId(defaultNew.id);
        return [defaultNew];
      }
      return next;
    });
  }, [activeId]);

  const handleAiResult = useCallback(({ code }) => {
    if (!code || !activeFile) return;
    setDiff({ original: activeFile.content, modified: code });
  }, [activeFile]);

  const handleApplyDiff = useCallback(() => {
    if (!diff || !activeId) return;
    updateFile(activeId, { content: diff.modified });
    setDiff(null);
  }, [diff, activeId, updateFile]);

  const handleCancelDiff = useCallback(() => setDiff(null), []);

  const fetchSavedFiles = useCallback(async () => {
    try {
      const res = await api.files.list();
      setSavedFiles(res.files || []);
    } catch (err) {
      toast.error(err.message || "Failed to load files");
    }
  }, [toast]);

  useEffect(() => {
    if (user) {
      fetchSavedFiles();
    }
  }, [user, fetchSavedFiles]);

  const handleSave = useCallback(async () => {
    if (!activeFile) return;
    try {
      const payload = {
        id: activeFile.remoteId,
        filename: activeFile.name || "Untitled",
        language: activeFile.language,
        content: activeFile.content,
      };
      const res = await api.files.save(payload);
      updateFile(activeId, { remoteId: res.file.id, name: res.file.filename });
      await fetchSavedFiles();
      toast.success("File saved");
    } catch (err) {
      toast.error(err.message || "Save failed");
    }
  }, [activeFile, activeId, fetchSavedFiles, toast, updateFile]);

  const handleLoad = useCallback(async (fileId) => {
    if (!fileId) return;
    try {
      const res = await api.files.get(fileId);
      const file = res.file;
      updateFile(activeId, {
        name: file.filename,
        language: file.language,
        content: file.content,
        remoteId: file.id,
      });
      toast.success("File loaded");
    } catch (err) {
      toast.error(err.message || "Load failed");
    }
  }, [activeId, toast, updateFile]);

  const handleDelete = useCallback(async (fileId) => {
    try {
      await api.files.delete(fileId);
      await fetchSavedFiles();
      if (activeFile?.remoteId === fileId) {
        updateFile(activeId, { remoteId: null });
      }
      toast.success("File deleted");
    } catch (err) {
      toast.error(err.message || "Delete failed");
    }
  }, [activeFile?.remoteId, activeId, fetchSavedFiles, toast, updateFile]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "n" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        addFile();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [addFile]);

  if (!activeFile) {
    return (
      <div className="flex flex-1 items-center justify-center text-text-secondary">
        No file open. Use Ctrl+N to add a file.
      </div>
    );
  }

  return (
    <div className="flex flex-1 overflow-hidden">
      <FileSidebar
        files={savedFiles}
        onRefresh={fetchSavedFiles}
        onLoad={handleLoad}
        onDelete={handleDelete}
        onNew={addFile}
        onSave={handleSave}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-border bg-surface px-2 py-1">
          <FileTabs
            files={files}
            activeId={activeId}
            onSelect={setActiveId}
            onClose={closeFile}
          />
          <div className="flex items-center gap-2">
            <input
              value={activeFile.name}
              onChange={(e) => updateFile(activeId, { name: e.target.value })}
              className="w-40 rounded border border-border bg-bg px-2 py-1.5 text-xs text-text"
              placeholder="Filename"
            />
            <select
              value={activeFile.language}
              onChange={(e) => updateFile(activeId, { language: e.target.value })}
              className="rounded border border-border bg-bg px-2 py-1.5 text-xs text-text"
              aria-label="Language"
            >
              {LANGUAGES.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleSave}
              className="rounded bg-accent px-3 py-1.5 text-xs font-medium text-white hover:bg-accent-hover"
            >
              Save
            </button>
            <button
              type="button"
              onClick={addFile}
              className="rounded px-2 py-1.5 text-xs text-text-secondary hover:bg-border hover:text-text"
              title="New file (Ctrl+N)"
            >
              + New
            </button>
          </div>
        </div>
        <div className="flex flex-1 min-h-0">
          <div className="flex flex-1 flex-col min-h-0">
            <div className="flex-1 min-h-0">
              <CodeEditor
                value={activeFile.content}
                language={activeFile.language}
                onChange={(value) => updateFile(activeId, { content: value ?? "" })}
                height="100%"
              />
            </div>
            {diff && (
              <div className="h-[45%] shrink-0">
                <DiffView
                  original={diff.original}
                  modified={diff.modified}
                  language={activeFile.language}
                  onClose={handleCancelDiff}
                  onApply={handleApplyDiff}
                />
              </div>
            )}
          </div>
          <AIPanel
            code={activeFile.content}
            language={activeFile.language}
            editorContent={activeFile.content}
            onResult={handleAiResult}
            onApplyCode={(code) => updateFile(activeId, { content: code })}
          />
        </div>
      </div>
    </div>
  );
}
