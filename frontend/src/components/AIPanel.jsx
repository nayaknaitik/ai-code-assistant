import { useState, useRef, useEffect } from "react";
import { api } from "../lib/api";
import { useToast } from "../context/ToastContext";
import { LANGUAGES, GROQ_MODELS } from "../lib/constants";

const ACTIONS = [
  { id: "explain", label: "Explain", icon: "📖" },
  { id: "bugs", label: "Find bugs", icon: "🐛" },
  { id: "refactor", label: "Refactor", icon: "✨" },
  { id: "optimize", label: "Optimize", icon: "⚡" },
  { id: "convert", label: "Convert", icon: "🔄" },
  { id: "chat", label: "Chat", icon: "💬" },
  { id: "code", label: "Code", icon: "🛠️" },
];

export default function AIPanel({
  code,
  language,
  editorContent,
  onResult,
  onApplyCode,
  disabled,
}) {
  const [activeAction, setActiveAction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [convertTo, setConvertTo] = useState("python");
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  // Default to the fast model (second option if available).
  const [model, setModel] = useState(GROQ_MODELS[1]?.id || GROQ_MODELS[0].id);
  const chatEndRef = useRef(null);
  const chatScrollRef = useRef(null);
  const { toast } = useToast();

  const currentCode = typeof code === "string" ? code : (editorContent || "");
  const safeCode = currentCode ?? "";

  useEffect(() => {
    if (chatScrollRef.current && chatHistory.length) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const run = async (actionId, extra = {}) => {
    if (!["chat", "code"].includes(actionId) && !safeCode.trim()) {
      toast.error("Select or add some code first");
      setResult({ type: "error", content: "Add code to the editor first, then try again." });
      return;
    }
    setLoading(true);
    setResult(null);
    setActiveAction(actionId);
    try {
      switch (actionId) {
        case "explain": {
          const res = await api.ai.explain(safeCode, language);
          setResult({ type: "text", content: res.explanation });
          break;
        }
        case "bugs": {
          const res = await api.ai.bugs(safeCode, language);
          setResult({ type: "text", content: res.analysis });
          break;
        }
        case "refactor": {
          const res = await api.ai.refactor(safeCode, language);
          setResult({ type: "diff", original: safeCode, modified: res.code });
          onResult?.({ action: "refactor", code: res.code });
          break;
        }
        case "optimize": {
          const res = await api.ai.optimize(safeCode, language);
          setResult({
            type: "diff",
            original: safeCode,
            modified: res.code,
            explanation: res.explanation,
          });
          onResult?.({ action: "optimize", code: res.code });
          break;
        }
        case "convert": {
          const res = await api.ai.convert(safeCode, language, convertTo);
          setResult({ type: "diff", original: safeCode, modified: res.code, toLang: convertTo });
          onResult?.({ action: "convert", code: res.code });
          break;
        }
        case "chat": {
          const msg = extra.message ?? chatInput;
          if (!String(msg).trim()) {
            toast.error("Enter a message");
            setLoading(false);
            return;
          }
          const messagesForApi = [
            ...chatHistory.map((m) => ({ role: m.role, content: m.content })),
            { role: "user", content: msg.trim() },
          ];
          const res = await api.ai.chatWithHistory(messagesForApi, safeCode, language, model);
          const newHistory = [
            ...chatHistory,
            { role: "user", content: msg.trim() },
            { role: "assistant", content: res.message },
          ];
          setChatHistory(newHistory);
          setChatInput("");
          setResult({ type: "chat", lastReply: res.message });
          chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
          break;
        }
        case "code": {
          const msg = extra.message ?? chatInput;
          if (!String(msg).trim()) {
            toast.error("Enter a coding instruction");
            setLoading(false);
            return;
          }
          const res = await api.ai.chatCode(msg.trim(), safeCode, language, model);
          if (res.action === "clarify") {
            setResult({ type: "text", content: `AI needs clarification: ${res.question}` });
            return;
          }
          if (res.action === "apply" && res.code) {
            setResult({
              type: "diff",
              original: safeCode,
              modified: res.code,
              explanation: res.rationale,
            });
            onResult?.({ action: "code", code: res.code });
            return;
          }
          setResult({ type: "text", content: res.rationale || "No changes suggested." });
          break;
        }
        default:
          break;
      }
    } catch (err) {
      const message = err?.message || "Request failed";
      toast.error(message);
      setResult({ type: "error", content: message });
    } finally {
      setLoading(false);
    }
  };

  const handleChatSubmit = (e) => {
    e.preventDefault();
    const mode = activeAction === "code" ? "code" : "chat";
    run(mode, { message: chatInput });
  };

  const handleChatKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleChatSubmit(e);
    }
  };

  return (
    <div className="flex h-full flex-col border-l border-border bg-surface w-[380px] shrink-0">
      <div className="border-b border-border p-3">
        <label className="mb-2 block text-xs font-medium text-text-secondary">Model</label>
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="w-full rounded border border-border bg-bg px-3 py-2 text-sm text-text focus:border-accent"
        >
          {GROQ_MODELS.map((m) => (
            <option key={m.id} value={m.id}>
              {m.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-wrap gap-1.5 border-b border-border p-3">
        {ACTIONS.map((a) => (
          <button
            key={a.id}
            type="button"
            disabled={disabled || loading}
            onClick={() => {
              if (a.id === "chat" || a.id === "code") {
                setActiveAction(a.id);
              } else {
                run(a.id);
              }
            }}
            className={`rounded px-2.5 py-1.5 text-xs font-medium transition-colors ${
              activeAction === a.id
                ? "bg-accent text-white"
                : "bg-border/50 text-text-secondary hover:bg-border hover:text-text"
            } disabled:opacity-50`}
          >
            {a.icon} {a.label}
          </button>
        ))}
      </div>

      {(activeAction === "chat" || activeAction === "code") && (
        <>
          <div
            ref={chatScrollRef}
            className="flex-1 overflow-auto min-h-0 p-3 space-y-3 border-b border-border"
          >
            {chatHistory.length === 0 && !loading && (
              <p className="text-xs text-muted">
                {activeAction === "code"
                  ? "Describe the code change you want. Enter to send, Shift+Enter for new line."
                  : "Ask about your code. Enter to send, Shift+Enter for new line."}
              </p>
            )}
            {chatHistory.map((m, i) => (
              <div
                key={i}
                className={`rounded p-2 text-sm ${
                  m.role === "user" ? "bg-border/50 text-text" : "bg-bg text-text-secondary"
                }`}
              >
                {m.content}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <form onSubmit={handleChatSubmit} className="flex shrink-0 flex-col gap-2 p-3 border-b border-border">
            <textarea
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={handleChatKeyDown}
              placeholder={activeAction === "code" ? "Describe the code change…" : "Ask about the code…"}
              rows={2}
              className="w-full resize-none rounded border border-border bg-bg px-3 py-2 text-sm text-text placeholder-muted focus:border-accent"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !chatInput.trim()}
              className="rounded bg-accent px-3 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
            >
              {activeAction === "code" ? "Send code instruction" : "Send"}
            </button>
          </form>
        </>
      )}

      {activeAction === "convert" && (
        <div className="flex shrink-0 items-center gap-2 border-b border-border p-3">
          <label className="text-xs text-text-secondary">Convert to:</label>
          <select
            value={convertTo}
            onChange={(e) => setConvertTo(e.target.value)}
            className="rounded border border-border bg-bg px-2 py-1.5 text-sm text-text"
          >
            {LANGUAGES.filter((l) => l.id !== language).map((l) => (
              <option key={l.id} value={l.id}>
                {l.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={loading || !safeCode.trim()}
            onClick={() => run("convert")}
            className="rounded bg-accent px-3 py-1.5 text-xs font-medium text-white hover:bg-accent-hover disabled:opacity-50"
          >
            Convert
          </button>
        </div>
      )}

      <div className="flex-1 overflow-auto p-3 min-h-0">
        {loading && (
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-border border-t-accent" />
            Thinking…
          </div>
        )}
        {result && !loading && (
          <>
            {result.type === "error" && (
              <div className="rounded border border-danger/50 bg-danger/10 p-3 text-sm text-danger">
                {result.content}
              </div>
            )}
            {result.type === "text" && (
              <div className="prose prose-invert prose-sm max-w-none">
                <pre className="whitespace-pre-wrap rounded border border-border bg-bg p-3 font-sans text-sm text-text">
                  {result.content}
                </pre>
              </div>
            )}
            {result.type === "diff" && (
              <div className="space-y-2">
                {result.explanation && (
                  <p className="text-xs text-text-secondary">{result.explanation}</p>
                )}
                <p className="text-xs text-text-secondary">
                  Use &quot;Apply changes&quot; in the diff view below to apply.
                </p>
              </div>
            )}
            {result.type === "chat" && result.lastReply && (
              <div className="rounded p-2 text-sm bg-bg text-text-secondary">
                {result.lastReply}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
