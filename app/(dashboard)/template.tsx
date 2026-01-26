"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { pageTransition } from '@/lib/motion-variants';

export default function DashboardTemplate({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={pathname}
                variants={pageTransition}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="h-full"
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
}
