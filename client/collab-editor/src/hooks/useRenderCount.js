import { useRef, useEffect } from "react";
function useRenderCount(componentName) {
  const count = useRef(0);
  useEffect(() => {
    count.current += 1;
  });
}
export default useRenderCount;
