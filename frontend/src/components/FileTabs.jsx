import { LANGUAGES } from "../lib/constants";

export default function FileTabs({ files, activeId, onSelect, onClose, onLanguageChange }) {
  return (
    <div className="flex shrink-0 items-center gap-0.5 border-b border-border bg-surface px-2">
      {files.map((f) => {
        const isActive = f.id === activeId;
        const langLabel = LANGUAGES.find((l) => l.id === f.language)?.label ?? f.language;
        return (
          <div
            key={f.id}
            role="tab"
            tabIndex={0}
            aria-selected={isActive}
            onClick={() => onSelect(f.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect(f.id);
              }
              if (e.key === "w" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                onClose(f.id);
              }
            }}
            className={`flex items-center gap-2 rounded-t px-3 py-2 text-sm transition-colors ${
              isActive ? "bg-bg text-text" : "text-text-secondary hover:bg-border hover:text-text"
            }`}
          >
            <span className="font-mono text-xs text-muted">{langLabel}</span>
            <span>{f.name}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose(f.id);
              }}
              className="rounded p-0.5 hover:bg-border hover:text-text"
              aria-label={`Close ${f.name}`}
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
}
