"use client";

import { createContext, useContext, useCallback, ReactNode } from 'react';
import useSound from 'use-sound';
import { useLocalStorage } from '@/hooks/use-local-storage';

type SoundContextType = {
    playSound: (soundId: string) => void;
    isMuted: boolean;
    toggleMute: () => void;
};

const SoundContext = createContext<SoundContextType | null>(null);

// Sound sprite map - defines timing for each sound in the sprite
const spriteMap: Record<string, [number, number]> = {
    click: [0, 150],
    hover: [200, 100],
    success: [350, 300],
    error: [700, 250],
    whoosh: [1000, 400],
};

export function SoundProvider({ children }: { children: ReactNode }) {
    const [isMuted, setIsMuted] = useLocalStorage('fennix-sound-muted', false);

    // Initialize sound with sprite
    // Note: The actual sound file will be created later
    // For now, this will fail gracefully if the file doesn't exist
    const [play] = useSound('/sounds/ui-sprite.mp3', {
        sprite: spriteMap,
        volume: 0.3,
        soundEnabled: !isMuted,
    });

    const playSound = useCallback(
        (soundId: string) => {
            if (!isMuted && spriteMap[soundId as keyof typeof spriteMap]) {
                try {
                    play({ id: soundId });
                } catch (error) {
                    // Silently fail if sound file doesn't exist yet
                    console.warn('Sound playback failed:', error);
                }
            }
        },
        [isMuted, play]
    );

    const toggleMute = useCallback(() => {
        setIsMuted((prev) => !prev);
    }, [setIsMuted]);

    return (
        <SoundContext.Provider value={{ playSound, isMuted, toggleMute }}>
            {children}
        </SoundContext.Provider>
    );
}

export function useSoundEffect() {
    const context = useContext(SoundContext);
    if (!context) {
        throw new Error('useSoundEffect must be used within a SoundProvider');
    }
    return context;
}
