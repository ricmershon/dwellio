"use client";

import { useEffect, useState } from "react";

interface DelayedRenderProps {
    children: React.ReactNode;
    delay?: number;   // defaults to 500ms
}

const DelayedRender = ({ children, delay = 500 }: DelayedRenderProps) => {
    const [isVisible, setIsVisible] = useState(false);
    
    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), delay);
        return () => clearTimeout(timer);
    }, [delay]);

    return isVisible ? <>{children}</> : null;
};

export default DelayedRender;