import { RefObject, useEffect } from "react";

type AnyEvent = MouseEvent | TouchEvent | PointerEvent | KeyboardEvent;

export const useClickOutside = (
    refs: RefObject<HTMLElement | null> | RefObject<HTMLElement | null>[], // single or multiple refs considered "inside"
    onOutside: (event: AnyEvent) => void,
    enabled = true
) => {
    useEffect(() => {
        if (!refs) {
            return;
        }

        const refList = Array.isArray(refs) ? refs : [refs];
        if (!enabled) {
            return;
        }

        const isInside = (target: EventTarget | null) => {
            const node = target as Node | null;
            return refList.some((ref) => ref.current && (ref.current === node || ref.current.contains(node)));
        };

        const onPointer = (event: PointerEvent) => {
            if (!isInside(event.target)) {
                onOutside(event);
            }
        };

        const onKey = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onOutside(event);
            }
        };

        // pointerdown fires earlier than click; feels snappier and covers mouse+touch+pen
        document.addEventListener("pointerdown", onPointer, true); // capture to beat stopPropagation
        document.addEventListener("keydown", onKey);

        return () => {
            document.removeEventListener("pointerdown", onPointer, true);
            document.removeEventListener("keydown", onKey);
        };
    }, [enabled, onOutside, refs]);
}
