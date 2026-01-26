# Fennix OS UI Sounds

## Placeholder Sound File

This directory will contain the UI sound sprite for Fennix OS.

### Required Sound File
- **File:** `ui-sprite.mp3`
- **Format:** MP3 (for broad browser compatibility)
- **Sprite Map:**
  - `click`: 0ms - 150ms
  - `hover`: 200ms - 300ms
  - `success`: 350ms - 650ms
  - `error`: 700ms - 950ms
  - `whoosh`: 1000ms - 1400ms

### Temporary Solution
For now, the SoundContext will fail gracefully if this file doesn't exist.

### Getting Free UI Sounds
You can download free UI sound packs from:
1. **Freesound.org** - Search for "UI click" or "button sound"
2. **Zapsplat.com** - Free UI sound effects
3. **Mixkit.co** - Free sound effects library

### Creating the Sprite
Once you have individual sounds, use a tool like:
- **Audacity** (free) - Import sounds, arrange them, export as MP3
- **Online Audio Joiner** - https://audio-joiner.com/

The sprite should be a single MP3 file with all sounds arranged sequentially with the timing defined in the sprite map above.
