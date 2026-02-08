import React, { useEffect } from "react";

export const useOutsideClick = (
    ref: React.RefObject<HTMLDivElement | null>,
    callback: Function
) => {
    useEffect(() => {
        const listener = (event: any) => {
            // DO NOT SCROLL TOP START;
            // if (!ref.current || ref.current.contains(event.target)) {
            //   return;
            // }
            // listener implementation
            if (!ref.current || ref.current.contains(event.target)) {
                return;
            }
            callback(event);
        };

        document.addEventListener("mousedown", listener);
        document.addEventListener("touchstart", listener);

        return () => {
            document.removeEventListener("mousedown", listener);
            document.removeEventListener("touchstart", listener);
        };
    }, [ref, callback]);
};
