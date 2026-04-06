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

const [wordCount, setWordCount] = useState(0);

const handleChange = (delta, html) => {
  setSaveStatus("unsaved");

  if (editorRef.current) {
    const quill = editorRef.current.getQuill();
    if (quill) {
      const text = quill.getText().trim();
      const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
      setWordCount(words);
    }
  }
};

const Editor = forwardRef(
  ({ documentId, initialContent, onSave, onChange }, ref) => {
    const editorRef = useRef(null);
    const quillRef = useRef(null);
    const saveTimerRef = useRef(null);

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
  },
);

export default Editor;
