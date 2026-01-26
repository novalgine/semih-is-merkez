"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useMagnetic } from '@/hooks/use-magnetic';
import { useSoundEffect } from '@/contexts/sound-context';
import { cn } from '@/lib/utils';

interface SidebarLinkProps {
    href: string;
    children: React.ReactNode;
    label: string;
}

export function SidebarLink({ href, children, label }: SidebarLinkProps) {
    const pathname = usePathname();
    const isActive = pathname === href;
    const { ref, style, handlers } = useMagnetic({ strength: 0.2 });
    const { playSound } = useSoundEffect();

    const handleMouseEnter = () => {
        playSound('hover');
        handlers.onMouseEnter();
    };

    return (
        <motion.div
            ref={ref as any}
            style={style}
            onMouseMove={handlers.onMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handlers.onMouseLeave}
            className="w-full"
        >
            <Link
                href={href}
                onClick={() => playSound('click')}
                className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all",
                    isActive
                        ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                        : "text-muted-foreground hover:bg-white/[0.05] hover:text-white"
                )}
            >
                {children}
                {label}
            </Link>
        </motion.div>
    );
}
