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

    const [play] = useSound(TEST_SOUND_URL, {
        volume: 0.12, // Subtle whisper feedback
        soundEnabled: !isMuted,
        interrupt: true,
        onload: () => console.log("Sound loaded successfully!"),
        onloaderror: (id: any, err: any) => console.error("Sound load error:", err),
    });

    const playSound = useCallback(
        (soundId: string) => {
            console.log(`Attempting to play sound: ${soundId} (Muted: ${isMuted})`);

            if (!isMuted) {
                try {
                    play();
                    console.log("Sound played!");
                } catch (error) {
                    console.error('Sound playback failed:', error);
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
