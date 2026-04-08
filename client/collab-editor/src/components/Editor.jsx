import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import "../styles/editor.css";

const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, false] }],
  ["bold", "italic", "underline", "strike"],
  [{ list: "ordered" }, { list: "bullet" }],
  ["blockquote", "code-block"],
  [{ color: [] }, { background: [] }],
  ["link"],
  ["clean"],
];

const Editor = forwardRef(
  ({ documentId, initialContent, onSave, onChange, wordCount }, ref) => {
    const editorRef = useRef(null);
    const quillRef = useRef(null);

    useImperativeHandle(ref, () => ({
      getContent: () => {
        if (!quillRef.current) return { delta: "", html: "" };
        return {
          delta: JSON.stringify(quillRef.current.getContents()),
          html: quillRef.current.root.innerHTML,
        };
      },

      setContent: (deltaString) => {
        if (!quillRef.current) return;
        try {
          const delta = JSON.parse(deltaString);
          quillRef.current.setContents(delta, "api");
        } catch {
          quillRef.current.setText(deltaString, "api");
        }
      },

      applyDelta: (delta) => {
        if (!quillRef.current) return;
        const currentSelection = quillRef.current.getSelection();
        quillRef.current.updateContents(delta, "api");
        if (currentSelection) {
          quillRef.current.setSelection(currentSelection, "api");
        }
      },

      getQuill: () => quillRef.current,

      focus: () => {
        if (quillRef.current) {
          quillRef.current.focus();
        }
      },
    }));

    useEffect(() => {
      if (quillRef.current) return;

      const quill = new Quill(editorRef.current, {
        theme: "snow",
        modules: {
          toolbar: TOOLBAR_OPTIONS,
        },
        placeholder: "Start writing...",
      });

      quillRef.current = quill;

      if (initialContent) {
        try {
          const delta = JSON.parse(initialContent);
          quill.setContents(delta);
        } catch {
          quill.setText(initialContent);
        }
      }

      quill.on("text-change", (delta, oldDelta, source) => {
        if (source !== "user") return;

        const contents = quill.getContents();
        const html = quill.root.innerHTML;

        if (onChange) {
          onChange(contents, html);
        }
      });
    }, []);

    useEffect(() => {
      if (quillRef.current && initialContent) {
        const currentLength = quillRef.current.getLength();
        if (currentLength <= 1) {
          try {
            const delta = JSON.parse(initialContent);
            quillRef.current.setContents(delta);
          } catch {
            quillRef.current.setText(initialContent);
          }
        }
      }
    }, [initialContent]);

    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <div
          style={{
            height: "52px",
            background: "#fff",
            borderBottom: "1px solid #E5E7EB",
            display: "flex",
            alignItems: "center",
            padding: "0 12px",
            gap: "8px",
            overflowX: "auto",
            overflowY: "hidden",
            flexShrink: 0,
            WebkitOverflowScrolling: "touch",
          }}
        >
          <span
            style={{
              fontSize: "12px",
              color: "#9CA3AF",
              whiteSpace: "nowrap",
              display: window.innerWidth < 640 ? "none" : "inline",
            }}
          >
            {wordCount} words
          </span>
        </div>
        <div ref={editorRef} style={{ flex: 1 }} />
      </div>
    );
  },
);

export default Editor;
