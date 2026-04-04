const shimmerStyle = `
  @keyframes shimmer {
    0% { background-position: -468px 0; }
    100% { background-position: 468px 0; }
  }
  .skeleton-shimmer {
    background: linear-gradient(
      90deg,
      #f0f0f0 25%,
      #e0e0e0 50%,
      #f0f0f0 75%
    );
    background-size: 936px 100%;
    animation: shimmer 1.4s ease-in-out infinite;
  }
`;

function SkeletonBlock({
  width = "100%",
  height = "16px",
  borderRadius = "6px",
  style = {},
}) {
  return (
    <>
      <style>{shimmerStyle}</style>
      <div
        className="skeleton-shimmer"
        style={{
          width,
          height,
          borderRadius,
          ...style,
        }}
      />
    </>
  );
}

export function DocumentCardSkeleton() {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #E5E7EB",
        borderRadius: "12px",
        padding: "20px",
      }}
    >
      <style>{shimmerStyle}</style>
      <div
        className="skeleton-shimmer"
        style={{
          width: "44px",
          height: "56px",
          borderRadius: "6px",
          marginBottom: "14px",
        }}
      />
      <div
        className="skeleton-shimmer"
        style={{
          width: "70%",
          height: "16px",
          borderRadius: "6px",
          marginBottom: "10px",
        }}
      />
      <div
        className="skeleton-shimmer"
        style={{
          width: "45%",
          height: "12px",
          borderRadius: "6px",
        }}
      />
    </div>
  );
}

export function EditorSkeleton() {
  return (
    <div style={{ padding: "40px 60px", maxWidth: "860px", margin: "0 auto" }}>
      <style>{shimmerStyle}</style>
      <div
        className="skeleton-shimmer"
        style={{
          width: "40%",
          height: "28px",
          borderRadius: "6px",
          marginBottom: "32px",
        }}
      />
      {[100, 85, 92, 60, 78, 95, 70].map((width, i) => (
        <div
          key={i}
          className="skeleton-shimmer"
          style={{
            width: `${width}%`,
            height: "16px",
            borderRadius: "6px",
            marginBottom: "14px",
          }}
        />
      ))}
      <div style={{ height: "24px" }} />
      {[88, 72, 95, 65].map((width, i) => (
        <div
          key={i}
          className="skeleton-shimmer"
          style={{
            width: `${width}%`,
            height: "16px",
            borderRadius: "6px",
            marginBottom: "14px",
          }}
        />
      ))}
    </div>
  );
}

export default SkeletonBlock;
