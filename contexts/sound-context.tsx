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

// Using a reliable CDN URL for testing
// This is a short "pop" sound
const TEST_SOUND_URL = "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3";

export function SoundProvider({ children }: { children: ReactNode }) {
    const [isMuted, setIsMuted] = useLocalStorage('fennix-sound-muted', false);

    // Always call useSound unconditionally to avoid hook count mismatch
    const [play] = useSound(TEST_SOUND_URL, {
        volume: 0.12,
        interrupt: true,
        onload: () => console.log("Sound loaded successfully!"),
        onloaderror: (_id: unknown, err: unknown) => console.error("Sound load error:", err),
    });

    const playSound = useCallback(
        (soundId: string) => {
            // Check conditions before playing, not in hook options
            if (isMuted) return;

            console.log(`Attempting to play sound: ${soundId}`);

            try {
                play();
            } catch (error) {
                console.error('Sound playback failed:', error);
            }
        },
        [isMuted, play]
    );

    const toggleMute = useCallback(() => {
        setIsMuted((prev) => !prev);
    }, [setIsMuted]);

    // Prevent hydration mismatch by rendering children only, or rendering provider with default safe values until mounted
    // Actually, context provider is fine to render, just consumers need to be safe.
    // The issue was `useLocalStorage` causing mismatch in `isMuted` value.
    // Now that useLocalStorage is safe, `isMuted` is `false` on server and `false` on client first render.
    // Then it updates. So no mismatch.

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
