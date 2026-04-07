import { useState, useEffect, useCallback } from "react";

function DocumentStats({ quill, documentId, createdAt, updatedAt }) {
  const [stats, setStats] = useState({
    words: 0,
    characters: 0,
    charactersNoSpaces: 0,
    paragraphs: 0,
    sentences: 0,
    readingTime: 0,
  });

  const computeStats = useCallback(() => {
    if (!quill) return;

    const text = quill.getText();

    const words = text.trim()
      ? text.trim().split(/\s+/).filter(Boolean).length
      : 0;

    const characters = text.length - 1; 

    const charactersNoSpaces = text.replace(/\s/g, "").length;

    const paragraphs = text
      .split("\n")
      .filter((line) => line.trim().length > 0).length;

    const sentences =
      (text.match(/[.!?]+\s/g) || []).length +
      (text.trim().match(/[.!?]$/) ? 1 : 0);

    const readingTime = Math.max(1, Math.ceil(words / 238));

    setStats({
      words,
      characters,
      charactersNoSpaces,
      paragraphs,
      sentences,
      readingTime,
    });
  }, [quill]);

  useEffect(() => {
    if (!quill) return;
    computeStats(); 

    quill.on("text-change", computeStats);
    return () => quill.off("text-change", computeStats);
  }, [quill, computeStats]);

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown";
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      style={{
        position: "fixed",
        right: 0,
        top: "60px",
        bottom: 0,
        width: "280px",
        background: "#fff",
        borderLeft: "1px solid #E5E7EB",
        overflowY: "auto",
        zIndex: 40,
        boxShadow: "-4px 0 16px rgba(0,0,0,0.06)",
      }}
    >
      <div style={{ padding: "20px" }}>
        <h3
          style={{
            fontSize: "16px",
            fontWeight: "600",
            color: "#111827",
            marginBottom: "20px",
          }}
        >
          Document statistics
        </h3>

        {}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "10px",
            marginBottom: "20px",
          }}
        >
          <StatCard label="Words" value={stats.words.toLocaleString()} accent />
          <StatCard
            label="Characters"
            value={stats.characters.toLocaleString()}
          />
          <StatCard
            label="No spaces"
            value={stats.charactersNoSpaces.toLocaleString()}
          />
          <StatCard
            label="Paragraphs"
            value={stats.paragraphs.toLocaleString()}
          />
          <StatCard
            label="Sentences"
            value={stats.sentences.toLocaleString()}
          />
          <StatCard
            label="Read time"
            value={`~${stats.readingTime} min`}
            accent
          />
        </div>

        {}
        <div style={{ borderTop: "1px solid #E5E7EB", marginBottom: "16px" }} />

        {}
        <div>
          <p
            style={{
              fontSize: "11px",
              fontWeight: "600",
              color: "#9CA3AF",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: "12px",
            }}
          >
            Document info
          </p>

          <MetaRow label="Created" value={formatDate(createdAt)} />
          <MetaRow label="Last saved" value={formatDate(updatedAt)} />
        </div>

        {}
        {stats.words > 0 && (
          <>
            <div style={{ borderTop: "1px solid #E5E7EB", margin: "16px 0" }} />
            <div
              style={{
                background: "#F5F3FF",
                borderRadius: "10px",
                padding: "14px",
              }}
            >
              <p
                style={{
                  fontSize: "13px",
                  fontWeight: "500",
                  color: "#4F46E5",
                  marginBottom: "4px",
                }}
              >
                {stats.words < 100
                  ? "✍️ Just getting started"
                  : stats.words < 500
                    ? "📝 Good progress!"
                    : stats.words < 1000
                      ? "🔥 You're on a roll!"
                      : "🏆 Excellent work!"}
              </p>
              <p style={{ fontSize: "12px", color: "#7C3AED" }}>
                {stats.words} words written
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }) {
  return (
    <div
      style={{
        background: accent ? "#EEF2FF" : "#F9FAFB",
        borderRadius: "8px",
        padding: "12px",
      }}
    >
      <p
        style={{
          fontSize: "18px",
          fontWeight: "700",
          color: accent ? "#4F46E5" : "#111827",
          marginBottom: "2px",
        }}
      >
        {value}
      </p>
      <p style={{ fontSize: "12px", color: "#9CA3AF" }}>{label}</p>
    </div>
  );
}

function MetaRow({ label, value }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        marginBottom: "10px",
      }}
    >
      <span style={{ fontSize: "12px", color: "#9CA3AF", marginBottom: "2px" }}>
        {label}
      </span>
      <span style={{ fontSize: "13px", color: "#374151", fontWeight: "500" }}>
        {value}
      </span>
    </div>
  );
}

export default DocumentStats;
