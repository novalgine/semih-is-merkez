import { useRef, useState, useCallback } from 'react';
import { useMotionValue, useSpring, useTransform } from 'framer-motion';

interface UseMagneticOptions {
    strength?: number;
    springConfig?: {
        stiffness?: number;
        damping?: number;
    };
}

export function useMagnetic(options: UseMagneticOptions = {}) {
    const { strength = 0.3, springConfig = { stiffness: 150, damping: 15 } } = options;

    const ref = useRef<HTMLElement>(null);
    const [isHovered, setIsHovered] = useState(false);

    // Motion values for x and y position
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    // Spring animations for smooth movement
    const springX = useSpring(x, springConfig);
    const springY = useSpring(y, springConfig);

    const handleMouseMove = useCallback(
        (e: React.MouseEvent<HTMLElement>) => {
            if (!ref.current) return;

            const rect = ref.current.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            // Calculate distance from center
            const distanceX = e.clientX - centerX;
            const distanceY = e.clientY - centerY;

            // Apply magnetic effect (pull towards mouse)
            x.set(distanceX * strength);
            y.set(distanceY * strength);
        },
        [strength, x, y]
    );

    const handleMouseEnter = useCallback(() => {
        setIsHovered(true);
    }, []);

    const handleMouseLeave = useCallback(() => {
        setIsHovered(false);
        // Spring back to center
        x.set(0);
        y.set(0);
    }, [x, y]);

    return {
        ref,
        isHovered,
        style: {
            x: springX,
            y: springY,
        },
        handlers: {
            onMouseMove: handleMouseMove,
            onMouseEnter: handleMouseEnter,
            onMouseLeave: handleMouseLeave,
        },
    };
}
