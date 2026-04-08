import { useRef, useEffect } from "react";

function useRenderCount(componentName) {
  const count = useRef(0);

  useEffect(() => {
    count.current += 1;
    if (process.env.NODE_ENV === "development") {
      console.log(`[Render] ${componentName}: ${count.current}`);
    }
  });
}

export default useRenderCount;
