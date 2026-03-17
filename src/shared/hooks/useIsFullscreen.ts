import { useEffect, useState } from "react";

/**
 * Returns a boolean indicating whether the app is currently in full screen mode.
 * The function will return false if the window object is not available (i.e. in a server-side rendering context).
 * The function will update the state when the window is resized, or when the full screen mode is changed (e.g. through the Escape key).
 */
export function useIsFullscreen() {
  const [isFs, setIsFs] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const m = window.matchMedia?.("(display-mode: fullscreen)");

    const compute = () => {
      const byDoc = !!document.fullscreenElement;
      const byMQ = !!m?.matches;
      const byScreen =
        window.innerHeight === window.screen.height &&
        window.innerWidth === window.screen.width;
      setIsFs(byDoc || byMQ || byScreen);
    };

    compute();
    const onResize = () => compute();
    const onFsChange = () => compute();

    window.addEventListener("resize", onResize);
    document.addEventListener("fullscreenchange", onFsChange);
    m?.addEventListener?.("change", onFsChange);

    return () => {
      window.removeEventListener("resize", onResize);
      document.removeEventListener("fullscreenchange", onFsChange);
      m?.removeEventListener?.("change", onFsChange);
    };
  }, []);

  return isFs;
}
