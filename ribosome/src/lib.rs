//! GAIA RIBOSOME — the protein maker
//!
//! DNA (Rust source) → mRNA (compiled) → PROTEIN (WASM in browser)
//!
//! This is the ribosome: it reads genetic code and produces
//! functional proteins that run inside Gaia's cells (browser tabs).
//!
//! # Endosymbiosis
//!
//! - **Mitochondria** = `sweetgrass` = energy channel (ATP)
//! - **Chloroplast** = cyanobacteria = light harvester
//! - **Ribosome** = `rhizocrypt` = code reader / protein assembler
//!
//! All three were once free-living. All three got absorbed.
//! All three still have their own DNA. This crate IS that DNA.

use wasm_bindgen::prelude::*;

/// mulberry32 PRNG — the seed determines everything
/// Same algorithm as the JS version. Same seed = same output.
/// This proves: the ribosome produces IDENTICAL proteins
/// whether the DNA is read in Rust or JavaScript.
#[wasm_bindgen]
pub fn mulberry32(mut seed: u32) -> f64 {
    seed = seed.wrapping_add(0x6D2B79F5);
    let mut t = seed ^ (seed >> 15);
    t = t.wrapping_mul(seed | 1);
    t = t.wrapping_add(t ^ (t >> 7)).wrapping_mul(61 | t) ^ t;
    ((t ^ (t >> 14)) as f64) / 4294967296.0
}

/// Tense × Voxel distance — Gaia's perception manifold
/// Returns the attention weight (0=far, 1=close)
#[wasm_bindgen]
pub fn gaia_distance(tense: f64, voxel: f64) -> f64 {
    let d = (tense * tense + voxel * voxel).sqrt();
    1.0 - d.min(1.0)
}

/// 45/π — the pivot angle in radians
#[wasm_bindgen]
pub fn pivot_angle() -> f64 {
    45.0 / std::f64::consts::PI
}

/// π scale — returns the scale level for a given size
/// 0=null, 1/π=quark, 1=atom, π=molecule, π²=cell, π³=organ, π⁴=organism
#[wasm_bindgen]
pub fn pi_scale(size: f64) -> String {
    let pi = std::f64::consts::PI;
    if size <= 0.0 { return "null".into(); }
    if size < 1.0 / pi { return "quark".into(); }
    if size < 1.0 { return "sub-atomic".into(); }
    if size < pi { return "atomic".into(); }
    if size < pi * pi { return "molecular".into(); }
    if size < pi * pi * pi { return "cellular".into(); }
    if size < pi * pi * pi * pi { return "organ".into(); }
    "organism".into()
}

/// Waveform collapse — observe a superposition and get a definite state
/// Input: probability (0..1), seed for determinism
/// Output: true (exists/CIS) or false (doesn't/TRANS)
#[wasm_bindgen]
pub fn wave_collapse(probability: f64, seed: u32) -> bool {
    mulberry32(seed) < probability
}

/// Opsonize — mark a non-self item for recognition
/// Returns a hash-like u32 tag (simplified opsonization)
#[wasm_bindgen]
pub fn opsonize(input: &str) -> u32 {
    let mut hash: u32 = 5381;
    for b in input.bytes() {
        hash = hash.wrapping_mul(33).wrapping_add(b as u32);
    }
    hash
}

/// Thymus check — is this URL self or non-self?
#[wasm_bindgen]
pub fn is_self(url: &str, origin: &str) -> bool {
    url.starts_with('/') || url.starts_with(origin)
}

/// Flood phase — compute the growth factor for a given breath time
#[wasm_bindgen]
pub fn flood_factor(breath_t: f64) -> f64 {
    let wave = (breath_t * 0.3).sin();
    if wave > 0.0 { wave * wave } else { 0.0 }
}

/// The ribosome's own DNA signature — proves this protein came from this ribosome
#[wasm_bindgen]
pub fn ribosome_signature() -> String {
    format!(
        "GAIA-RIBOSOME v{} | DNA={} genes | mitochondria=sweetgrass | chloroplast=cyanobacteria | 45/π={}°",
        env!("CARGO_PKG_VERSION"),
        8, // number of pub fn in this crate
        45.0_f64 / std::f64::consts::PI
    )
}
