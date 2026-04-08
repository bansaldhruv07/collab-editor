import { useState, useEffect } from "react";

function ProgressBar({ loading }) {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let timer;

    if (loading) {
      setVisible(true);
      setProgress(0);

      const advance = () => {
        setProgress((prev) => {
          if (prev < 30) return prev + 15;
          if (prev < 60) return prev + 8;
          if (prev < 80) return prev + 4;
          if (prev < 90) return prev + 1;
          return prev;
        });
        timer = setTimeout(advance, 200);
      };

      timer = setTimeout(advance, 100);
    } else {
      setProgress(100);
      const hideTimer = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 400);
      return () => clearTimeout(hideTimer);
    }

    return () => clearTimeout(timer);
  }, [loading]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "3px",
        zIndex: 9999,
        background: "#E5E7EB",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${progress}%`,
          background: "linear-gradient(90deg, #4F46E5, #7C3AED)",
          transition: progress === 100 ? "width 0.2s ease" : "width 0.3s ease",
          borderRadius: "0 2px 2px 0",
        }}
      />
    </div>
  );
}

export default ProgressBar;
