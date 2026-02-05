export default function FileSidebar({ files, onRefresh, onLoad, onDelete, onNew, onSave }) {
  return (
    <div className="flex w-64 shrink-0 flex-col border-r border-border bg-surface">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <div className="text-sm font-semibold text-text">Files</div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onRefresh}
            className="rounded px-2 py-1 text-xs text-text-secondary hover:bg-border hover:text-text"
            title="Refresh"
          >
            ↻
          </button>
          <button
            type="button"
            onClick={onNew}
            className="rounded bg-accent px-3 py-1 text-xs font-medium text-white hover:bg-accent-hover"
          >
            New
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-2 p-3 overflow-auto">
        {files.length === 0 && (
          <p className="text-xs text-text-secondary">No saved files yet.</p>
        )}
        {files.map((f) => (
          <div
            key={f.id}
            className="rounded border border-border bg-bg p-2 text-sm text-text-secondary"
          >
            <div className="flex items-center justify-between">
              <span className="text-text">{f.filename}</span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => onLoad(f.id)}
                  className="rounded px-2 py-1 text-xs text-text-secondary hover:bg-border hover:text-text"
                >
                  Load
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(f.id)}
                  className="rounded px-2 py-1 text-xs text-danger hover:bg-border hover:text-text"
                >
                  Del
                </button>
              </div>
            </div>
            <div className="mt-1 text-[11px] text-muted">{f.language}</div>
            <div className="text-[11px] text-muted">Updated {new Date(f.updatedAt).toLocaleString()}</div>
          </div>
        ))}
      </div>
      <div className="mt-auto border-t border-border p-3">
        <button
          type="button"
          onClick={onSave}
          className="w-full rounded bg-accent px-3 py-2 text-xs font-medium text-white hover:bg-accent-hover"
        >
          Save current file
        </button>
      </div>
    </div>
  );
}
