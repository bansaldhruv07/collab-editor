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

const Editor = forwardRef(function Editor(
  { documentId, initialContent, onSave, onChange, onCursorMove, onSelectionChange, wordCount },
  ref
) {
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

      setCursor: (userId, range, color, name) => {
        if (!quillRef.current) return;

        const existingCursor = document.querySelector(
          `[data-cursor-id="${userId}"]`
        );
        if (existingCursor) existingCursor.remove();

        if (!range) return;

        const bounds = quillRef.current.getBounds(range.index);
        if (!bounds) return;

        const cursor = document.createElement('div');
        cursor.setAttribute('data-cursor-id', userId);
        cursor.style.cssText = `
          position: absolute;
          left: ${bounds.left}px;
          top: ${bounds.top}px;
          height: ${bounds.height}px;
          width: 2px;
          background: ${color};
          pointer-events: none;
          z-index: 10;
        `;

        const label = document.createElement('div');
        label.textContent = name;
        label.style.cssText = `
          position: absolute;
          top: -20px;
          left: 0;
          background: ${color};
          color: white;
          font-size: 11px;
          padding: 2px 6px;
          border-radius: 4px;
          white-space: nowrap;
          pointer-events: none;
        `;

        cursor.appendChild(label);

        quillRef.current.root.style.position = 'relative';
        quillRef.current.root.appendChild(cursor);
      },

      setSelection: (userId, range, color, name) => {
        if (!quillRef.current) return;

        const existing = quillRef.current.root.querySelectorAll(
          `[data-selection-id="${userId}"]`
        );
        existing.forEach(el => el.remove());

        if (!range || range.length === 0) return;

        try {
          const startBounds = quillRef.current.getBounds(range.index);
          const endBounds = quillRef.current.getBounds(range.index + range.length);

          if (!startBounds || !endBounds) return;

          const highlight = document.createElement('div');
          highlight.setAttribute('data-selection-id', userId);

          const top = Math.min(startBounds.top, endBounds.top);
          const left = range.index === range.index + range.length
            ? startBounds.left
            : 0;
          const width = startBounds.top === endBounds.top
            ? endBounds.left - startBounds.left
            : quillRef.current.root.offsetWidth;
          const height = endBounds.top - startBounds.top + endBounds.height;

          highlight.style.cssText = `
            position: absolute;
            top: ${top}px;
            left: ${left}px;
            width: ${Math.max(width, 20)}px;
            height: ${Math.max(height, startBounds.height)}px;
            background: ${color}26;
            border: 1px solid ${color}60;
            border-radius: 2px;
            pointer-events: none;
            z-index: 5;
          `;

          const label = document.createElement('div');
          label.textContent = name;
          label.style.cssText = `
            position: absolute;
            top: -18px;
            left: 0;
            background: ${color};
            color: white;
            font-size: 10px;
            padding: 1px 5px;
            border-radius: 3px;
            white-space: nowrap;
            pointer-events: none;
            font-family: sans-serif;
          `;
          highlight.appendChild(label);

          quillRef.current.root.style.position = 'relative';
          quillRef.current.root.appendChild(highlight);
        } catch (err) {}
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

        const html = quill.root.innerHTML;

        if (onChange) {
          onChange(delta, html);
        }
      });

      quill.on("selection-change", (range, oldRange, source) => {
        if (source !== "user") return;

        if (onCursorMove) {
          onCursorMove(range);
        }

        if (onSelectionChange) {
          onSelectionChange(range);
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
