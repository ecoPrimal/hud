# Hacker News Post Draft

**Title**: Show HN: Sovereign scientific computing in Rust – 3.6M LOC, GPU via Vulkan/WGSL, zero cloud dependencies

**URL**: https://primals.eco

**Text (for Ask HN or Show HN comment)**:

I built a self-hosted scientific computing ecosystem in pure Rust. The goal: reproduce peer-reviewed research without any commercial dependencies in the inner membrane — no CUDA, no OpenSSL, no SQLite, no LAPACK, no cloud.

GPU compute runs through Vulkan/WGSL, which means any GPU vendor works, not just NVIDIA. Native f64 precision. 952 compute shaders.

The ecosystem has 175+ reproduced papers across metagenomics, lattice QCD, pharmacology, precision agriculture, neural architectures, uncertainty quantification, and remote sensing. Each validated against published numerical results.

Infrastructure: 7 physical compute nodes, 10G fiber backbone, sovereign DNS (Knot DNS with DNSSEC), Forgejo CI, autonomous mesh enrollment. The licensing cost for the entire stack: zero.

Development uses what I call K-NOME methodology — human architectural constraint + AI implementation. Every commit is transparent about what was human-directed vs AI-written.

I'm posting this because zero-knowledge competes by collaboration. If someone already built this better, I'd rather know now and mesh with theirs. If nobody did, maybe this is useful.

AGPL-3.0. Free for humans, education, and nonprofits.

https://primals.eco — the membrane  
https://sporeprint.primals.eco — the papers  
https://github.com/ecoPrimals — the code  
