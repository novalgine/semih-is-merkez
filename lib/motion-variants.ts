import { Variants } from 'framer-motion';

/**
 * Fennix OS Motion Variants
 * Standard animation presets for consistent motion design
 */

// Fade In Animation
export const fadeIn: Variants = {
    hidden: {
        opacity: 0,
    },
    visible: {
        opacity: 1,
        transition: {
            duration: 0.3,
            ease: 'easeOut',
        },
    },
    exit: {
        opacity: 0,
        transition: {
            duration: 0.2,
            ease: 'easeIn',
        },
    },
};

// Slide Up Animation (for modals, cards)
export const slideUp: Variants = {
    hidden: {
        y: 20,
        opacity: 0,
    },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            duration: 0.4,
            ease: [0.25, 0.1, 0.25, 1], // Custom easing curve
        },
    },
    exit: {
        y: -10,
        opacity: 0,
        transition: {
            duration: 0.2,
            ease: 'easeIn',
        },
    },
};

// Slide Down (for dropdowns, notifications)
export const slideDown: Variants = {
    hidden: {
        y: -20,
        opacity: 0,
    },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            duration: 0.3,
            ease: 'easeOut',
        },
    },
    exit: {
        y: -10,
        opacity: 0,
        transition: {
            duration: 0.2,
        },
    },
};

// Scale Animation (for buttons, icons)
export const scale: Variants = {
    hidden: {
        scale: 0.8,
        opacity: 0,
    },
    visible: {
        scale: 1,
        opacity: 1,
        transition: {
            duration: 0.3,
            ease: [0.34, 1.56, 0.64, 1], // Bounce easing
        },
    },
    exit: {
        scale: 0.9,
        opacity: 0,
        transition: {
            duration: 0.2,
        },
    },
};

// Stagger Container (for lists, grids)
export const staggerContainer: Variants = {
    hidden: {
        opacity: 0,
    },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1,
        },
    },
    exit: {
        opacity: 0,
        transition: {
            staggerChildren: 0.05,
            staggerDirection: -1,
        },
    },
};

// Stagger Item (child of staggerContainer)
export const staggerItem: Variants = {
    hidden: {
        y: 20,
        opacity: 0,
    },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            duration: 0.4,
            ease: 'easeOut',
        },
    },
    exit: {
        y: -10,
        opacity: 0,
        transition: {
            duration: 0.2,
        },
    },
};

// Page Transition (for route changes)
export const pageTransition: Variants = {
    hidden: {
        opacity: 0,
        y: 10,
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.3,
            ease: 'easeOut',
        },
    },
    exit: {
        opacity: 0,
        y: -10,
        transition: {
            duration: 0.2,
            ease: 'easeIn',
        },
    },
};

// Magnetic Button Hover (for interactive elements)
export const magneticHover = {
    rest: {
        scale: 1,
    },
    hover: {
        scale: 1.05,
        transition: {
            duration: 0.2,
            ease: 'easeOut',
        },
    },
    tap: {
        scale: 0.98,
        transition: {
            duration: 0.1,
        },
    },
};

// Curtain Reveal (for portal intro)
export const curtainReveal: Variants = {
    hidden: {
        scaleX: 1,
    },
    visible: {
        scaleX: 0,
        transition: {
            duration: 0.8,
            ease: [0.76, 0, 0.24, 1], // Custom cubic-bezier
        },
    },
};

// Glow Pulse (for notifications, badges)
export const glowPulse: Variants = {
    initial: {
        opacity: 0.6,
    },
    animate: {
        opacity: [0.6, 1, 0.6],
        transition: {
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
        },
    },
};
