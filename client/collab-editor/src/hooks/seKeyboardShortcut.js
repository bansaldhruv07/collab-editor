import { useEffect } from "react";

function useKeyboardShortcut(key, callback, modifier = "ctrl") {
  useEffect(() => {
    const handleKeyDown = (e) => {
      const modifierPressed =
        modifier === "ctrl"
          ? e.ctrlKey || e.metaKey
          : modifier === "shift"
            ? e.shiftKey
            : modifier === "alt"
              ? e.altKey
              : false;

      if (modifierPressed && e.key.toLowerCase() === key.toLowerCase()) {
        e.preventDefault();
        callback();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [key, callback, modifier]);
}

export default useKeyboardShortcut;
