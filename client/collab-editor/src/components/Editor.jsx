import { useEffect, useRef, useCallback } from "react";
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

function Editor({ documentId, initialContent, onSave, onChange }) {
  const editorRef = useRef(null);
  const quillRef = useRef(null);
  const saveTimerRef = useRef(null);

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

      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
      saveTimerRef.current = setTimeout(() => {
        if (onSave) {
          onSave(JSON.stringify(contents), html);
        }
      }, 2000);
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

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div ref={editorRef} style={{ flex: 1 }} />
    </div>
  );
}

export default Editor;
