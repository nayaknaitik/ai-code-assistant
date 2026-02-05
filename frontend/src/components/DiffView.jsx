import { DiffEditor } from "@monaco-editor/react";

const OPTIONS = {
  minimap: { enabled: false },
  fontSize: 13,
  fontFamily: "JetBrains Mono, monospace",
  readOnly: true,
  renderSideBySide: true,
  automaticLayout: true,
  diffWordWrap: "on",
};

export default function DiffView({ original, modified, language, onClose, onApply }) {
  const lang = language === "plaintext" ? "plaintext" : language;

  return (
    <div className="flex h-full flex-col border-t border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border px-3 py-2 text-xs text-text-secondary">
        <span>Review AI changes before applying</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onApply}
            className="rounded bg-accent px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-accent-hover"
          >
            Apply changes
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-border px-3 py-1.5 text-xs transition-colors hover:bg-border"
          >
            Cancel
          </button>
        </div>
      </div>
      <div className="flex-1 min-h-0">
        <DiffEditor
          height="100%"
          language={lang}
          original={original}
          modified={modified}
          options={OPTIONS}
          theme="vs-dark"
          loading={
            <div className="flex h-full items-center justify-center bg-[#1e1e1e] text-text-secondary">
              Loading diff…
            </div>
          }
        />
      </div>
    </div>
  );
}
