function Spinner({ size = 40 }) {
  return (
    <div
      style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}
    >
      <div
        style={{
          width: size,
          height: size,
          border: "3px solid #E5E7EB",
          borderTop: "3px solid #4F46E5",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
export default Spinner;
