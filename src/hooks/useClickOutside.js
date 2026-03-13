import { useEffect } from "react";

/**
 * Calls `handler` when the user clicks outside the element referenced by `ref`.
 * @param {React.RefObject} ref - Ref attached to the element to watch.
 * @param {() => void} handler - Callback to run on outside click.
 * @param {boolean} [enabled=true] - Set to false to disable the listener.
 */
export function useClickOutside(ref, handler, enabled = true) {
    useEffect(() => {
        if (!enabled) return;

        const listener = (event) => {
            if (!ref.current || ref.current.contains(event.target)) return;
            handler(event);
        };

        document.addEventListener("mousedown", listener);
        document.addEventListener("touchstart", listener);

        return () => {
            document.removeEventListener("mousedown", listener);
            document.removeEventListener("touchstart", listener);
        };
    }, [ref, handler, enabled]);
}
