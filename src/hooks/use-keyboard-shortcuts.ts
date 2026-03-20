import { useEffect } from "react";

interface ShortcutActions {
  toggleSimulation: () => void;
  nextPrediction: () => void;
  prevPrediction: () => void;
  toggleTheme: () => void;
  toggleSidebar: () => void;
}

export function useKeyboardShortcuts(actions: ShortcutActions) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ignore when typing in inputs
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      switch (e.key.toLowerCase()) {
        case "s":
          e.preventDefault();
          actions.toggleSimulation();
          break;
        case "arrowright":
        case "j":
          e.preventDefault();
          actions.nextPrediction();
          break;
        case "arrowleft":
        case "k":
          e.preventDefault();
          actions.prevPrediction();
          break;
        case "t":
          e.preventDefault();
          actions.toggleTheme();
          break;
        case "f":
          e.preventDefault();
          actions.toggleSidebar();
          break;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [actions]);
}
