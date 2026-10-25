"""
TAMISON'S PUZZLE SONG v2 — A REAL SONG
═══════════════════════════════════════
Not just tones. MUSIC. Melody, harmony, rhythm, structure.
IS/WAS/NOW as musical eras: 
  WAS = medieval/renaissance (modal, plainchant, fifths)
  IS  = classical/romantic (major/minor, chord progressions, resolution)
  NOW = modern/electronic (clusters, tension, unresolved, alive)

The puzzle: the melody still encodes π, but now it SINGS.

Triple-licensed: AGPL-3.0 (code) · ORC (mechanics) · CC-BY-SA-4.0 (content)
"""

import wave
import struct
import math
import os
import random

SAMPLE_RATE = 44100
BPM = 72  # heartbeat tempo (~π/4 seconds per beat)

def note_freq(name):
    """Convert note name to frequency. e.g. 'C4', 'A#3', 'Eb5'"""
    notes = {'C':0,'C#':1,'Db':1,'D':2,'D#':3,'Eb':3,'E':4,'F':5,
             'F#':6,'Gb':6,'G':7,'G#':8,'Ab':8,'A':9,'A#':10,'Bb':10,'B':11}
    if name[-1].isdigit():
        octave = int(name[-1])
        note_name = name[:-1]
    else:
        return 0
    semitone = notes.get(note_name, 0)
    return 440.0 * (2 ** ((semitone - 9 + (octave - 4) * 12) / 12.0))

def beat_duration(beats, bpm=BPM):
    return beats * 60.0 / bpm

# === INSTRUMENT VOICES ===

def organ_tone(freq, duration, amplitude=0.35):
    """Medieval organ — rich harmonics, no vibrato, solemn."""
    n = int(SAMPLE_RATE * duration)
    samples = []
    for i in range(n):
        t = i / SAMPLE_RATE
        val = 0
        val += math.sin(2*math.pi*freq*t) * 0.5
        val += math.sin(4*math.pi*freq*t) * 0.25
        val += math.sin(6*math.pi*freq*t) * 0.15
        val += math.sin(8*math.pi*freq*t) * 0.08
        val += math.sin(10*math.pi*freq*t) * 0.04
        env = 1.0
        attack = int(0.02 * SAMPLE_RATE)
        release = int(0.08 * SAMPLE_RATE)
        if i < attack: env = i / attack
        elif i > n - release: env = (n - i) / release
        samples.append(val * amplitude * env)
    return samples

def piano_tone(freq, duration, amplitude=0.4):
    """Classical piano — sharp attack, exponential decay, warm."""
    n = int(SAMPLE_RATE * duration)
    samples = []
    for i in range(n):
        t = i / SAMPLE_RATE
        decay = math.exp(-t * 2.5)
        val = math.sin(2*math.pi*freq*t) * 0.6
        val += math.sin(4*math.pi*freq*t) * 0.2 * math.exp(-t*3)
        val += math.sin(6*math.pi*freq*t) * 0.1 * math.exp(-t*4)
        val += math.sin(3*math.pi*freq*t) * 0.05
        env = decay
        attack = int(0.005 * SAMPLE_RATE)
        if i < attack: env *= i / attack
        samples.append(val * amplitude * env)
    return samples

def synth_pad(freq, duration, amplitude=0.25):
    """Modern synth pad — slow attack, vibrato, ethereal."""
    n = int(SAMPLE_RATE * duration)
    samples = []
    for i in range(n):
        t = i / SAMPLE_RATE
        vibrato = 1.0 + 0.003 * math.sin(2*math.pi*5.5*t)
        f = freq * vibrato
        val = math.sin(2*math.pi*f*t) * 0.4
        val += math.sin(2*math.pi*f*1.002*t) * 0.3  # slight detune = width
        val += math.sin(2*math.pi*f*0.998*t) * 0.3
        val += math.sin(4*math.pi*f*t) * 0.1
        attack = int(0.15 * SAMPLE_RATE)
        release = int(0.2 * SAMPLE_RATE)
        env = 1.0
        if i < attack: env = i / attack
        elif i > n - release: env = (n - i) / release
        samples.append(val * amplitude * env)
    return samples

def pluck(freq, duration, amplitude=0.35):
    """Lute/guitar pluck — bright attack, fast decay."""
    n = int(SAMPLE_RATE * duration)
    samples = []
    for i in range(n):
        t = i / SAMPLE_RATE
        decay = math.exp(-t * 5)
        val = math.sin(2*math.pi*freq*t) * 0.4
        val += math.sin(4*math.pi*freq*t) * 0.3 * math.exp(-t*6)
        val += math.sin(6*math.pi*freq*t) * 0.2 * math.exp(-t*8)
        val += math.sin(8*math.pi*freq*t) * 0.1 * math.exp(-t*10)
        attack = int(0.003 * SAMPLE_RATE)
        env = decay
        if i < attack: env *= i / attack
        samples.append(val * amplitude * env)
    return samples

def silence(duration):
    return [0.0] * int(SAMPLE_RATE * duration)

def mix_layers(*layers):
    """Mix multiple sample arrays together."""
    max_len = max(len(l) for l in layers)
    result = [0.0] * max_len
    for layer in layers:
        for i, s in enumerate(layer):
            result[i] += s
    return result

def chord_organ(notes, duration, amplitude=0.2):
    layers = [organ_tone(note_freq(n), duration, amplitude/len(notes)) for n in notes]
    return mix_layers(*layers)

def chord_piano(notes, duration, amplitude=0.3):
    layers = [piano_tone(note_freq(n), duration, amplitude/len(notes)) for n in notes]
    return mix_layers(*layers)

def chord_pad(notes, duration, amplitude=0.2):
    layers = [synth_pad(note_freq(n), duration, amplitude/len(notes)) for n in notes]
    return mix_layers(*layers)

def write_wav(filename, samples, sample_rate=SAMPLE_RATE):
    with wave.open(filename, 'w') as wav:
        wav.setnchannels(1)
        wav.setsampwidth(2)
        wav.setframerate(sample_rate)
        peak = max(abs(s) for s in samples) or 1.0
        scale = 0.85 / peak
        for sample in samples:
            clamped = max(-1.0, min(1.0, sample * scale))
            packed = struct.pack('h', int(clamped * 32767))
            wav.writeframesraw(packed)

# ═══════════════════════════════════════════════════════════
# THE SONG
# ═══════════════════════════════════════════════════════════

def compose():
    song = []
    b = beat_duration  # shorthand
    
    # ═══ MOVEMENT I: WAS (Medieval/Renaissance) ═══════════
    # Gregorian-style: open fifths, modal, organ + plucked lute
    # Pi digits 3.1415 encoded in a Dorian melody
    # The past is solemn, spacious, echoing
    
    # Drone: D3 open fifth (D+A, medieval power chord)
    drone_was = chord_organ(['D3', 'A3'], b(16), 0.15)
    
    # Melody over the drone: plainchant encoding 3.1415
    # D=3, C=1, E=4, C=1, F=5 in Dorian mode
    melody_was = []
    melody_was.extend(pluck(note_freq('G3'), b(2)))      # 3 - the integer, solemn
    melody_was.extend(silence(b(0.5)))
    melody_was.extend(pluck(note_freq('G3'), b(2)))      # 3 again
    melody_was.extend(silence(b(0.5)))
    melody_was.extend(pluck(note_freq('G3'), b(2)))      # 3 - triple toll
    melody_was.extend(silence(b(1)))                       # the fold (silence)
    melody_was.extend(pluck(note_freq('D3'), b(1.5)))     # 1
    melody_was.extend(pluck(note_freq('A3'), b(1.5)))     # 4
    melody_was.extend(pluck(note_freq('D3'), b(1.5)))     # 1
    melody_was.extend(pluck(note_freq('C4'), b(2)))       # 5 (reaching up)
    melody_was.extend(silence(b(1)))
    
    was_section = mix_layers(drone_was, melody_was)
    song.extend(was_section)
    
    # Cadence: open fifth resolving to unison (medieval ending)
    song.extend(chord_organ(['D3', 'A3', 'D4'], b(3), 0.18))
    song.extend(silence(b(1)))
    
    # ═══ MOVEMENT II: IS (Classical/Romantic) ═════════════
    # Piano, chord progressions, major/minor tension
    # Pi digits 926535 as a melodic line with harmonic support
    # The present is warm, structured, breathing
    
    # I-V-vi-IV progression in G major (the 3 chord = G)
    prog = [
        (['G3', 'B3', 'D4'], b(2)),     # I   (G major)
        (['D3', 'F#3', 'A3'], b(2)),    # V   (D major)  
        (['E3', 'G3', 'B3'], b(2)),     # vi  (E minor)
        (['C3', 'E3', 'G3'], b(2)),     # IV  (C major)
    ]
    
    # Play progression twice with melody on top
    is_harmony = []
    for _ in range(2):
        for notes, dur in prog:
            is_harmony.extend(chord_piano(notes, dur, 0.25))
    
    # Melody: 9-2-6-5-3-5 mapped to G major scale
    # G=1 A=2 B=3 C=4 D=5 E=6 F#=7 G=8 A=9
    is_melody = []
    is_melody.extend(piano_tone(note_freq('A5'), b(1.5)))    # 9
    is_melody.extend(piano_tone(note_freq('A4'), b(1)))      # 2
    is_melody.extend(piano_tone(note_freq('E5'), b(1.5)))    # 6
    is_melody.extend(piano_tone(note_freq('D5'), b(1)))      # 5
    is_melody.extend(piano_tone(note_freq('B4'), b(2)))      # 3 (lingering)
    is_melody.extend(piano_tone(note_freq('D5'), b(1)))      # 5
    is_melody.extend(silence(b(1)))
    # Second phrase: 8-9-7-9 (the orbit that doesn't close)
    is_melody.extend(piano_tone(note_freq('G5'), b(1)))      # 8
    is_melody.extend(piano_tone(note_freq('A5'), b(1.5)))    # 9
    is_melody.extend(piano_tone(note_freq('F#5'), b(1)))     # 7
    is_melody.extend(piano_tone(note_freq('A5'), b(1.5)))    # 9
    is_melody.extend(piano_tone(note_freq('B4'), b(2)))      # resolve to 3
    is_melody.extend(silence(b(1.5)))
    
    is_section = mix_layers(is_harmony, is_melody)
    song.extend(is_section)
    
    # Classical cadence: V7 → I
    song.extend(chord_piano(['D3', 'F#3', 'A3', 'C4'], b(2), 0.3))
    song.extend(chord_piano(['G3', 'B3', 'D4', 'G4'], b(3), 0.3))
    song.extend(silence(b(1)))
    
    # ═══ MOVEMENT III: NOW (Modern/Electronic) ════════════
    # Synth pads, unresolved clusters, alive and breathing
    # The remainder 0.14159 as a haunting theme
    # The future is open, shimmering, unresolved
    
    # Cluster pad: stacked fourths (modern voicing)
    now_pad = chord_pad(['C3', 'F3', 'Bb3', 'Eb4'], b(8), 0.2)
    
    # Chipmunk's theme over the pad: 0.14159
    # Slower, deliberate, each note searching
    chipmunk = []
    chipmunk.extend(synth_pad(note_freq('C4'), b(2)))      # 0 = null = home
    chipmunk.extend(silence(b(0.5)))                        # the decimal fold
    chipmunk.extend(synth_pad(note_freq('Db4'), b(1.5)))   # 1 (half step up, tension)
    chipmunk.extend(synth_pad(note_freq('E4'), b(1.5)))    # 4
    chipmunk.extend(synth_pad(note_freq('Db4'), b(1)))     # 1 (returns)
    chipmunk.extend(synth_pad(note_freq('F4'), b(1.5)))    # 5
    
    now_section = mix_layers(now_pad, chipmunk)
    song.extend(now_section)
    
    # The 9 — reaching for the top, never arriving
    song.extend(synth_pad(note_freq('A4'), b(2), 0.3))     # 9
    
    # Unresolved cluster (life doesn't resolve)
    song.extend(chord_pad(['C4', 'E4', 'G4', 'Bb4'], b(4), 0.25))
    song.extend(silence(b(0.5)))
    
    # ═══ CODA: The fold — all three eras at once ═════════
    # Medieval drone + classical melody + modern pad
    # The Klein fold: WAS+IS+NOW superimposed
    
    coda_drone = chord_organ(['D2', 'A2'], b(8), 0.1)       # WAS: the ancient drone
    coda_piano_melody = []
    coda_piano_melody.extend(piano_tone(note_freq('G4'), b(2)))  # 3 (the floor)
    coda_piano_melody.extend(piano_tone(note_freq('D4'), b(1.5)))# 1
    coda_piano_melody.extend(piano_tone(note_freq('A4'), b(1.5)))# 4 (the chord)
    coda_piano_melody.extend(silence(b(3)))
    coda_pad = chord_pad(['G3', 'B3', 'D4', 'F#4'], b(8), 0.15) # NOW: shimmering
    
    coda = mix_layers(coda_drone, coda_piano_melody, coda_pad)
    song.extend(coda)
    
    # Final: fade on the null note for π seconds
    pi_dur = math.pi
    n_final = int(SAMPLE_RATE * pi_dur)
    for i in range(n_final):
        t = i / SAMPLE_RATE
        fade = 1.0 - (i / n_final)
        fade = fade * fade  # exponential feel
        val = 0.25 * fade * math.sin(2*math.pi*note_freq('G3')*t)
        val += 0.08 * fade * math.sin(2*math.pi*note_freq('D4')*t)
        val += 0.05 * fade * math.sin(2*math.pi*note_freq('B3')*t)
        song.append(val)
    
    return song

# === Compose and write ===
print("Composing Tamison's Puzzle Song v2...")
print()
print("MOVEMENT I:  WAS  (medieval — organ + lute, open fifths, modal)")
print("MOVEMENT II: IS   (classical — piano, major/minor, chord progressions)")
print("MOVEMENT III: NOW (modern — synth pads, clusters, unresolved)")
print("CODA:        THE FOLD (all three eras superimposed)")
print()

samples = compose()
duration = len(samples) / SAMPLE_RATE

output_dir = os.path.dirname(os.path.abspath(__file__))
output_path = os.path.join(output_dir, "tamison-puzzle-song-v2.wav")
write_wav(output_path, samples)

print(f"Written: {output_path}")
print(f"Duration: {duration:.2f} seconds")
print(f"Tempo: {BPM} BPM (heartbeat tempo)")
print()
print("THE PUZZLE:")
print("──────────")
print("Each movement encodes digits of π in a different musical era.")
print("The melody travels through time: WAS → IS → NOW.")
print("The coda folds all three together.")
print("The final note fades for exactly π seconds.")
print("The answer never resolves. The answer is alive.")
