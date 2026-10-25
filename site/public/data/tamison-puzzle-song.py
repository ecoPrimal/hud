"""
TAMISON'S PUZZLE SONG
═════════════════════
A song that IS a puzzle. The melody encodes π.
5-7-9 harmonic structure. Pentatonic → diatonic → chromatic.
Solve the melody = find the number = find the fold.

The puzzle: each note maps to a digit (0-9).
The melody spells 3.14159265358979...
The listener must decode the number from the tune.

Triple-licensed: AGPL-3.0 (code) · ORC (mechanics) · CC-BY-SA-4.0 (content)
"""

import wave
import struct
import math
import os

SAMPLE_RATE = 44100
AMPLITUDE = 0.6

# Pentatonic scale rooted at C4 (Hz) - mapped to digits 0-9
# Using two octaves of pentatonic to cover 10 digits
DIGIT_TO_FREQ = {
    0: 261.63,   # C4  (null, the root, the ground)
    1: 293.66,   # D4  (identity, one step up)
    2: 329.63,   # E4  (pair, the interval)
    3: 392.00,   # G4  (the integer, the floor, the AGREEMENT)
    4: 440.00,   # A4  (concert pitch, the standard)
    5: 523.25,   # C5  (octave up, the bound, pentatonic ceiling)
    6: 587.33,   # D5  (beyond 5, into diatonic)
    7: 659.25,   # E5  (diatonic, tension)
    8: 783.99,   # G5  (high, chromatic territory)
    9: 880.00,   # A5  (the top, full organism)
}

PI_DIGITS = "3141592653589793238462643383279502884197"

def generate_tone(freq, duration, sample_rate=SAMPLE_RATE, amplitude=AMPLITUDE, 
                  fade_in=0.01, fade_out=0.05):
    """Generate a sine wave tone with envelope."""
    n_samples = int(sample_rate * duration)
    samples = []
    fade_in_samples = int(sample_rate * fade_in)
    fade_out_samples = int(sample_rate * fade_out)
    
    for i in range(n_samples):
        t = i / sample_rate
        value = amplitude * math.sin(2 * math.pi * freq * t)
        
        # Add harmonics for warmth (like a real instrument)
        value += amplitude * 0.3 * math.sin(4 * math.pi * freq * t)  # 2nd harmonic
        value += amplitude * 0.1 * math.sin(6 * math.pi * freq * t)  # 3rd harmonic
        
        # Fade envelope
        if i < fade_in_samples:
            value *= i / fade_in_samples
        elif i > n_samples - fade_out_samples:
            value *= (n_samples - i) / fade_out_samples
            
        samples.append(value)
    
    return samples

def generate_silence(duration, sample_rate=SAMPLE_RATE):
    """Generate silence."""
    return [0.0] * int(sample_rate * duration)

def generate_chord(freqs, duration, sample_rate=SAMPLE_RATE, amplitude=0.3):
    """Generate a chord (multiple frequencies)."""
    n_samples = int(sample_rate * duration)
    samples = [0.0] * n_samples
    fade_out_samples = int(sample_rate * 0.1)
    
    for freq in freqs:
        for i in range(n_samples):
            t = i / sample_rate
            value = amplitude * math.sin(2 * math.pi * freq * t)
            fade = 1.0
            if i > n_samples - fade_out_samples:
                fade = (n_samples - i) / fade_out_samples
            samples[i] += value * fade / len(freqs)
    
    return samples

def write_wav(filename, samples, sample_rate=SAMPLE_RATE):
    """Write samples to a WAV file."""
    with wave.open(filename, 'w') as wav:
        wav.setnchannels(1)
        wav.setsampwidth(2)
        wav.setframerate(sample_rate)
        
        for sample in samples:
            clamped = max(-1.0, min(1.0, sample))
            packed = struct.pack('h', int(clamped * 32767))
            wav.writeframesraw(packed)

def compose_puzzle_song():
    """
    Structure:
    
    1. INTRO: Three low G notes (3... the integer floor)
    2. VERSE 1 (pentatonic): First 5 digits of pi (3.1415)
       - Each digit = one note, quarter note duration
       - Pentatonic = ground state, simple, folk
    3. PAUSE: The decimal point (silence = the fold)
    4. VERSE 2 (diatonic): Next 7 digits (9265358)
       - Faster rhythm, more notes, tension building
       - Diatonic = tension + resolution
    5. CHORUS: "ALIVE" chord (3-1-4 played together)
       - The answer chord: C+D+A = 0+1+4 = pi's first digits
    6. VERSE 3 (chromatic): Next 9 digits (979323846)
       - Fastest, most complex, all phases
       - Chromatic = full organism
    7. BRIDGE: The remainder (0.14159) played slowly, deliberately
       - The chipmunk's theme: 0-1-4-1-5-9
       - Slow, clear, the hidden curvature
    8. OUTRO: Fade on the null note (C4 = 0 = the fold)
    """
    
    all_samples = []
    
    # === INTRO: Three G4 notes (3-3-3, the integer floor) ===
    for _ in range(3):
        all_samples.extend(generate_tone(DIGIT_TO_FREQ[3], 0.6))
        all_samples.extend(generate_silence(0.15))
    all_samples.extend(generate_silence(0.5))
    
    # === VERSE 1 (pentatonic): 3.1415 ===
    # The "3" we already played. Now the decimal point = silence
    all_samples.extend(generate_silence(0.3))  # THE FOLD (decimal point)
    
    verse1_digits = "1415"
    for d in verse1_digits:
        freq = DIGIT_TO_FREQ[int(d)]
        all_samples.extend(generate_tone(freq, 0.4))
        all_samples.extend(generate_silence(0.1))
    all_samples.extend(generate_silence(0.4))
    
    # === VERSE 2 (diatonic): 9265358 ===
    verse2_digits = "9265358"
    for i, d in enumerate(verse2_digits):
        freq = DIGIT_TO_FREQ[int(d)]
        duration = 0.3 - (i * 0.02)  # Accelerating (tension)
        all_samples.extend(generate_tone(freq, max(duration, 0.15)))
        all_samples.extend(generate_silence(0.08))
    all_samples.extend(generate_silence(0.4))
    
    # === CHORUS: "ALIVE" chord (3+1+4 = G4+D4+A4) ===
    alive_chord = [DIGIT_TO_FREQ[3], DIGIT_TO_FREQ[1], DIGIT_TO_FREQ[4]]
    all_samples.extend(generate_chord(alive_chord, 1.5, amplitude=0.5))
    all_samples.extend(generate_silence(0.5))
    
    # === VERSE 3 (chromatic): 979323846 ===
    verse3_digits = "979323846"
    for i, d in enumerate(verse3_digits):
        freq = DIGIT_TO_FREQ[int(d)]
        all_samples.extend(generate_tone(freq, 0.2))
        all_samples.extend(generate_silence(0.05))
    all_samples.extend(generate_silence(0.6))
    
    # === BRIDGE: The remainder — chipmunk's theme (0.14159) ===
    # Slow, deliberate, the hidden curvature
    all_samples.extend(generate_tone(DIGIT_TO_FREQ[0], 0.8))   # 0 = null = C4
    all_samples.extend(generate_silence(0.3))                    # decimal = fold
    remainder_digits = "14159"
    for d in remainder_digits:
        freq = DIGIT_TO_FREQ[int(d)]
        all_samples.extend(generate_tone(freq, 0.6))
        all_samples.extend(generate_silence(0.2))
    all_samples.extend(generate_silence(0.5))
    
    # === OUTRO: The null note fading ===
    null_freq = DIGIT_TO_FREQ[0]  # C4 = 0 = the fold
    n_samples = int(SAMPLE_RATE * 3.14159)  # Duration = pi seconds!
    for i in range(n_samples):
        t = i / SAMPLE_RATE
        fade = 1.0 - (i / n_samples)  # Linear fade to nothing
        value = AMPLITUDE * 0.4 * fade * math.sin(2 * math.pi * null_freq * t)
        value += AMPLITUDE * 0.1 * fade * math.sin(4 * math.pi * null_freq * t)
        all_samples.append(value)
    
    return all_samples

# === Compose and write ===
print("Composing Tamison's Puzzle Song...")
print("Structure: 5-7-9 harmonic (pentatonic → diatonic → chromatic)")
print("Puzzle: the melody encodes a number. What number?")
print()

samples = compose_puzzle_song()
duration = len(samples) / SAMPLE_RATE

output_dir = os.path.dirname(os.path.abspath(__file__))
output_path = os.path.join(output_dir, "tamison-puzzle-song.wav")
write_wav(output_path, samples)

print(f"Written: {output_path}")
print(f"Duration: {duration:.2f} seconds")
print(f"Sample rate: {SAMPLE_RATE} Hz")
print()
print("PUZZLE CLUES:")
print("─────────────")
print("1. The intro plays the integer floor three times.")
print("2. The silence IS the decimal point.")
print("3. The chorus chord is the first three digits played together.")
print("4. The bridge is the chipmunk's theme: the hidden remainder.")
print("5. The outro fades for exactly π seconds.")
print("6. Each note = one digit. Pentatonic scale, two octaves, 0-9.")
print()
print("ANSWER: ██████████████████████")
print("(solve it by ear)")
print()
print("not solvable. not statistical. ALIVE.")
