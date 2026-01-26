"use client";

import { motion } from 'framer-motion';
import { useMagnetic } from '@/hooks/use-magnetic';
import { useSoundEffect } from '@/contexts/sound-context';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { VariantProps } from 'class-variance-authority';

interface MagneticButtonProps
    extends React.ComponentPropsWithoutRef<typeof Button>,
    VariantProps<typeof buttonVariants> {
    strength?: number;
    enableSound?: boolean;
}

export function MagneticButton({
    children,
    className,
    variant,
    size,
    strength = 0.3,
    enableSound = true,
    onClick,
    ...props
}: MagneticButtonProps) {
    const { ref, style, handlers } = useMagnetic({ strength });
    const { playSound } = useSoundEffect();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (enableSound) {
            playSound('click');
        }
        onClick?.(e);
    };

    const handleMouseEnter = () => {
        if (enableSound) {
            playSound('hover');
        }
        handlers.onMouseEnter();
    };

    return (
        <motion.div
            ref={ref as any}
            style={style}
            onMouseMove={handlers.onMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handlers.onMouseLeave}
            className="inline-block"
        >
            <Button
                variant={variant}
                size={size}
                className={cn(className)}
                onClick={handleClick}
                {...props}
            >
                {children}
            </Button>
        </motion.div>
    );
}
