import { useRef, useCallback } from "react";
import Editor from "@monaco-editor/react";

const MONACO_OPTIONS = {
  minimap: { enabled: false },
  fontSize: 13,
  fontFamily: "JetBrains Mono, monospace",
  lineNumbers: "on",
  scrollBeyondLastLine: false,
  padding: { top: 16 },
  renderLineHighlight: "line",
  cursorBlinking: "smooth",
  bracketPairColorization: { enabled: true },
  automaticLayout: true,
  tabSize: 2,
  wordWrap: "off",
};

export default function CodeEditor({ value, language, onChange, readOnly = false, height = "100%" }) {
  const editorRef = useRef(null);

  const handleEditorDidMount = useCallback((editor) => {
    editorRef.current = editor;
    editor.updateOptions({
      readOnly: !!readOnly,
    });
  }, [readOnly]);

  return (
    <div className="h-full w-full" style={{ minHeight: 200 }}>
      <Editor
        height={height}
        language={language === "plaintext" ? "plaintext" : language}
        value={value}
        onChange={onChange}
        onMount={handleEditorDidMount}
        options={{
          ...MONACO_OPTIONS,
          readOnly,
        }}
        theme="vs-dark"
        loading={
          <div className="flex h-full items-center justify-center bg-[#1e1e1e] text-text-secondary">
            Loading editor…
          </div>
        }
      />
    </div>
  );
}
