export const LANGUAGES = [
  { id: "javascript", label: "JavaScript" },
  { id: "typescript", label: "TypeScript" },
  { id: "python", label: "Python" },
  { id: "java", label: "Java" },
  { id: "cpp", label: "C++" },
  { id: "c", label: "C" },
  { id: "csharp", label: "C#" },
  { id: "go", label: "Go" },
  { id: "rust", label: "Rust" },
  { id: "ruby", label: "Ruby" },
  { id: "php", label: "PHP" },
  { id: "sql", label: "SQL" },
  { id: "json", label: "JSON" },
  { id: "html", label: "HTML" },
  { id: "css", label: "CSS" },
  { id: "plaintext", label: "Plain text" },
];

export const GROQ_MODELS = [
  { id: "mixtral-8x7b-32768", label: "Mixtral 8x7B" },
  { id: "llama-3.1-8b-instant", label: "LLaMA 3.1 8B (fast)" },
];

export const DEFAULT_FILE = {
  id: "default",
  name: "Untitled",
  language: "javascript",
  content: "// Start coding here\nfunction hello() {\n  console.log('Hello, world');\n}\n",
};
