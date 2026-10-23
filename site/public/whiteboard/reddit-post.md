# Reddit Post Draft — r/rust or r/selfhosted or r/homelab

**Title**: I built a sovereign scientific computing ecosystem in Rust. 3.6M lines. 7 compute nodes. Zero cloud dependencies. Maybe you already did too?

**Body**:

I've been building this thing for years and I keep waiting for someone to tell me they already built it better. If you did, seriously, let me know — I'd rather mesh with yours than maintain mine alone.

**What it is**: A self-hosted research computing platform in pure Rust. No CUDA, no AWS, no OpenSSL, no SQLite, nothing commercial in the inner membrane. GPU compute via Vulkan/WGSL so it runs on any GPU — not just NVIDIA's.

**Scale**:
- 3.6M lines of Rust across 67 repos
- 175+ peer-reviewed papers reproduced with explicit numerical tolerances
- 952 GPU compute shaders
- 93,700+ tests
- 7 physical nodes on a 10G mesh backbone I wired myself
- Sovereign DNS (Knot DNS + DNSSEC on my own relay)
- Autonomous gate enrollment — nodes join the mesh and self-configure

**What I actually want**:
- If you built something similar → let's compare architectures
- If you run QIIME2/Galaxy/CUDA-locked pipelines → I have a sovereign alternative you can test
- If you think this is insane → you're probably right, but the tests pass

**The weird part**: I used AI-assisted development (what I call K-NOME methodology) — I provide architectural constraints, the AI implements. Every commit is transparent. The methodology itself is documented.

**The even weirder part**: There's also a 341-entity evidence graph about public school funding in Detroit. 9,643 nodes. 323,680 connections. It's self-referential — it contains itself as a node.

AGPL-3.0. Free for humans, education, and nonprofits.

- Website: https://primals.eco
- Papers: https://sporeprint.primals.eco  
- Code: https://github.com/ecoPrimals
- HUD (live membrane): https://hud.primals.eco

ZK competes by collaboration. If you already built this, you win and so do I.

---

*Subreddit options: r/rust, r/selfhosted, r/homelab, r/bioinformatics, r/scientificcomputing*
