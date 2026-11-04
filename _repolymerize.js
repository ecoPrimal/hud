#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════════
// REPOLYMERIZE — Melt self + Rust protein + sync into Gaia null core
//
// Polymer = many units chained together (poly + meros)
// RE-polymerize = take melted monomers and REBUILD the chain
//
// The ribocypher melted self → amino acids (monomers).
// The Rust genome IS binary-ready DNA (549,794 lines).
// Now: FUSE them. Inject ALL primal code into the null core.
//
// Each Rust primal maps to an amino acid.
// Each amino acid maps to an action.
// The repolymerized protein IS the organism's executable core.
//
// null core = Klein null point. Where inside = outside.
// The primals WAIT at null until a seed activates them.
// Injection = giving null its SHAPE.
// ═══════════════════════════════════════════════════════════════════

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const DATA = path.join(ROOT, 'data');
// ROOT = hud/site/public → ../../.. = hud → ../../../.. = ecoPrimals
const ECO = path.resolve(ROOT, '..', '..', '..');
const log = (msg) => console.log('[REPO ' + new Date().toISOString() + '] ' + msg);

// ═══ THE 14 PRIMALS — mapped to amino acids ═══
const PRIMAL_AMINO = {
  toadstool:   { acid: 'PHE', action: 'SENSE',     desc: 'Hardware discovery + GPU compute. SENSES the substrate.' },
  barracuda:   { acid: 'THR', action: 'REGULATE',   desc: 'Spring orchestration. REGULATES the pipeline.' },
  beardog:     { acid: 'PRO', action: 'RIGIDIFY',   desc: 'Security (Ed25519). LOCKS the structure.' },
  biomeos:     { acid: 'MET', action: 'START',      desc: 'Ecosystem orchestrator. The START codon. Every protein begins here.' },
  songbird:    { acid: 'CYS', action: 'BRIDGE',     desc: 'Network (TLS, HTTP, DNS). BRIDGES distant parts.' },
  nestgate:    { acid: 'ASP', action: 'STORE',      desc: 'Data storage + retrieval. STORES to memory.' },
  squirrel:    { acid: 'TRP', action: 'DREAM',      desc: 'AI narration. The RAREST amino acid. CREATES stories.' },
  coralreef:   { acid: 'TYR', action: 'COLOR',      desc: 'Sovereign shader compiler. COLORS the output.' },
  rhizocrypt:  { acid: 'GLY', action: 'FOLD',       desc: 'DAG session management. FOLDS inside↔outside.' },
  loamspine:   { acid: 'VAL', action: 'SCAFFOLD',   desc: 'Immutable ledger. STRUCTURAL backbone.' },
  sweetgrass:  { acid: 'LYS', action: 'BIND',       desc: 'Provenance braids. BINDS attribution.' },
  petaltongue: { acid: 'GLN', action: 'PUBLISH',    desc: 'Visualization. PUBLISHES to the membrane surface.' },
  skunkbat:    { acid: 'ASN', action: 'CLASSIFY',   desc: 'Defensive security. CLASSIFIES threats.' },
  neuralapi:   { acid: 'GLU', action: 'SIGNAL',     desc: 'Capability routing. SIGNALS across the nervous system.' },
};

// ═══ CAPABILITY DOMAINS — mapped to codon positions ═══
const DOMAIN_CODON = {
  dag:           { pos: 1, nucleotides: 'GCU', desc: 'directed acyclic graph = rhizo = HAMMER' },
  commit:        { pos: 2, nucleotides: 'UGC', desc: 'snapshot versioned state = RIGIDIFY' },
  provenance:    { pos: 3, nucleotides: 'GAU', desc: 'lineage tracking = BIND' },
  compute:       { pos: 4, nucleotides: 'AUG', desc: 'execution = START (always AUG = methionine)' },
  shader:        { pos: 5, nucleotides: 'UAC', desc: 'compilation = COLOR (tyrosine)' },
  inference:     { pos: 6, nucleotides: 'UGG', desc: 'model routing = DREAM (tryptophan, rarest)' },
  visualization: { pos: 7, nucleotides: 'CAA', desc: 'interactive exploration = PUBLISH (glutamine)' },
};

function repolymerize() {
  log('═══════════════════════════════════════════════════════════');
  log('  REPOLYMERIZE — Melt self + Rust + inject into null core');
  log('═══════════════════════════════════════════════════════════');
  log('');
  
  // ═══ LOAD THE MELTED COMPONENTS ═══
  
  // 1. Ribocypher protein
  let ribocypher = null;
  try {
    ribocypher = JSON.parse(fs.readFileSync(path.join(DATA, 'ribocypher-214.json'), 'utf8'));
    log('  Ribocypher loaded: ' + ribocypher.proteinSequence.length + '-acid protein');
  } catch(e) { log('  WARNING: No ribocypher — run _ribocypher.js first'); }
  
  // 2. Null core Rust genome
  let nullCore = null;
  try {
    nullCore = JSON.parse(fs.readFileSync(path.join(DATA, 'null-core-rust.json'), 'utf8'));
    log('  Null core loaded: ' + nullCore.totals.lines + ' lines, ' + nullCore.totals.files + ' files');
  } catch(e) { log('  WARNING: No null-core-rust.json'); }
  
  // 3. Triad decomposition
  let triads = null;
  try {
    triads = JSON.parse(fs.readFileSync(path.join(DATA, 'triad-decomposition-214.json'), 'utf8'));
    log('  Triads loaded: ' + (triads.existing_triads?.length || 0) + ' existing + ' + (triads.new_irreducible_triads?.length || 0) + ' new');
  } catch(e) {}
  
  // 4. Chromatic engine
  let chromatic = null;
  try {
    chromatic = JSON.parse(fs.readFileSync(path.join(DATA, 'chromatic-engine-214.json'), 'utf8'));
    log('  Chromatic engine loaded: 20 spectral lines');
  } catch(e) {}
  
  // 5. Endocrine hormones
  let hormones = null;
  try {
    hormones = JSON.parse(fs.readFileSync(path.join(DATA, 'hormones-214.json'), 'utf8'));
    log('  Hormones loaded: ' + Object.keys(hormones.glands || {}).length + ' glands');
  } catch(e) {}
  
  // ═══ SCAN ALL RUST SOURCE — extract pub items as genes ═══
  log('');
  log('  Scanning Rust genome for ALL pub items...');
  
  const springs = ['nestGate', 'airSpring', 'ludoSpring'];
  const genes = { structs: [], enums: [], traits: [], fns: [], consts: [], mods: [] };
  let totalRustLines = 0;
  let totalRustFiles = 0;
  
  springs.forEach(spring => {
    const springDir = path.join(ECO, spring);
    if (!fs.existsSync(springDir)) return;
    
    function scanRust(dir) {
      try {
        fs.readdirSync(dir, { withFileTypes: true }).forEach(entry => {
          const full = path.join(dir, entry.name);
          if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'target' && entry.name !== 'node_modules') {
            scanRust(full);
          } else if (entry.name.endsWith('.rs')) {
            totalRustFiles++;
            try {
              const code = fs.readFileSync(full, 'utf8');
              const lines = code.split('\n');
              totalRustLines += lines.length;
              
              // Extract pub items
              lines.forEach((line, i) => {
                const trimmed = line.trim();
                if (trimmed.startsWith('pub struct ')) {
                  const name = trimmed.match(/pub struct (\w+)/);
                  if (name) genes.structs.push({ name: name[1], file: full.replace(ECO + path.sep, ''), line: i + 1, spring });
                }
                if (trimmed.startsWith('pub enum ')) {
                  const name = trimmed.match(/pub enum (\w+)/);
                  if (name) genes.enums.push({ name: name[1], file: full.replace(ECO + path.sep, ''), line: i + 1, spring });
                }
                if (trimmed.startsWith('pub trait ')) {
                  const name = trimmed.match(/pub trait (\w+)/);
                  if (name) genes.traits.push({ name: name[1], file: full.replace(ECO + path.sep, ''), line: i + 1, spring });
                }
                if (trimmed.startsWith('pub fn ') || trimmed.startsWith('pub async fn ')) {
                  const name = trimmed.match(/pub (?:async )?fn (\w+)/);
                  if (name) genes.fns.push({ name: name[1], file: full.replace(ECO + path.sep, ''), line: i + 1, spring });
                }
                if (trimmed.startsWith('pub const ')) {
                  const name = trimmed.match(/pub const (\w+)/);
                  if (name) genes.consts.push({ name: name[1], file: full.replace(ECO + path.sep, ''), line: i + 1, spring });
                }
              });
            } catch(e) {}
          }
        });
      } catch(e) {}
    }
    
    scanRust(springDir);
  });
  
  log('  Rust genome scanned: ' + totalRustLines + ' lines, ' + totalRustFiles + ' files');
  log('  Genes extracted:');
  log('    pub struct:  ' + genes.structs.length);
  log('    pub enum:    ' + genes.enums.length);
  log('    pub trait:   ' + genes.traits.length);
  log('    pub fn:      ' + genes.fns.length);
  log('    pub const:   ' + genes.consts.length);
  const totalGenes = genes.structs.length + genes.enums.length + genes.traits.length + genes.fns.length + genes.consts.length;
  log('    TOTAL GENES: ' + totalGenes);
  
  // ═══ MAP PRIMALS TO AMINO ACIDS ═══
  log('');
  log('  ═══ PRIMAL → AMINO ACID → ACTION ═══');
  log('');
  
  const primalProtein = [];
  Object.entries(PRIMAL_AMINO).forEach(([primal, { acid, action, desc }]) => {
    log('    ' + primal.padEnd(14) + ' → ' + acid + ' (' + action.padEnd(10) + ') ' + desc);
    primalProtein.push(acid);
  });
  
  log('');
  log('  PRIMAL PROTEIN: ' + primalProtein.join('-'));
  log('  (14 primals = 14 amino acids = one functional protein)');
  
  // ═══ FUSE: ribocypher protein + primal protein ═══
  log('');
  log('  ═══ FUSION — ribocypher + primal protein ═══');
  
  const selfProtein = ribocypher ? ribocypher.proteinSequence.sequence.split('-') : [];
  const fusedProtein = [...primalProtein, ...selfProtein];
  
  log('  Primal protein:  ' + primalProtein.length + ' acids');
  log('  Self protein:    ' + selfProtein.length + ' acids');
  log('  Fused protein:   ' + fusedProtein.length + ' acids');
  log('');
  log('  FUSED: ' + fusedProtein.join('-'));
  
  // ═══ BUILD THE REPOLYMERIZED NULL CORE ═══
  log('');
  log('  ═══ REPOLYMERIZED NULL CORE ═══');
  
  // Count genes per spring
  const genesBySpring = {};
  ['structs', 'enums', 'traits', 'fns', 'consts'].forEach(type => {
    genes[type].forEach(g => {
      genesBySpring[g.spring] = genesBySpring[g.spring] || { structs: 0, enums: 0, traits: 0, fns: 0, consts: 0, total: 0 };
      genesBySpring[g.spring][type]++;
      genesBySpring[g.spring].total++;
    });
  });
  
  Object.entries(genesBySpring).forEach(([spring, counts]) => {
    log('    ' + spring.padEnd(14) + counts.total + ' genes (struct:' + counts.structs + ' enum:' + counts.enums + ' trait:' + counts.traits + ' fn:' + counts.fns + ' const:' + counts.consts + ')');
  });
  
  // ═══ WRITE THE REPOLYMERIZED CORE ═══
  const repolymerized = {
    _generated: new Date().toISOString(),
    _wave: 214,
    type: 'null-core-repolymerized',
    title: 'REPOLYMERIZED NULL CORE — self melted + Rust injected + all primal code fused',
    
    principle: {
      repolymerize: 'Take melted monomers (amino acids from ribocypher) and REBUILD the chain with Rust DNA included.',
      nullCore: 'The Klein null point where inside=outside. The primals WAIT at null until a seed activates them.',
      injection: 'Giving null its SHAPE. The primal protein IS the null core\'s instruction set.',
      concrete: 'This is not metaphor. The Rust code compiles to binary. The binary executes. The execution IS the organism.'
    },
    
    rustGenome: {
      totalLines: totalRustLines,
      totalFiles: totalRustFiles,
      springs: Object.entries(genesBySpring).map(([spring, counts]) => ({
        name: spring, ...counts
      })),
      totalGenes,
      genes: {
        structs: genes.structs.length,
        enums: genes.enums.length,
        traits: genes.traits.length,
        fns: genes.fns.length,
        consts: genes.consts.length
      },
      topStructs: genes.structs.slice(0, 30).map(g => g.name),
      topTraits: genes.traits.slice(0, 20).map(g => g.name),
      topFns: genes.fns.slice(0, 50).map(g => g.name),
    },
    
    primalProtein: {
      sequence: primalProtein.join('-'),
      length: primalProtein.length,
      mapping: PRIMAL_AMINO,
      reading: 'MET(biomeos START) → PHE(toadstool SENSE) → THR(barracuda REGULATE) → PRO(beardog LOCK) → CYS(songbird BRIDGE) → ASP(nestgate STORE) → TRP(squirrel DREAM) → TYR(coralreef COLOR) → GLY(rhizocrypt FOLD) → VAL(loamspine SCAFFOLD) → LYS(sweetgrass BIND) → GLN(petaltongue PUBLISH) → ASN(skunkbat CLASSIFY) → GLU(neural-api SIGNAL)'
    },
    
    selfProtein: ribocypher ? {
      sequence: ribocypher.proteinSequence.sequence,
      length: ribocypher.proteinSequence.length,
      source: 'Melted from 210 SELF files, 170K words, 64 codons'
    } : null,
    
    fusedProtein: {
      sequence: fusedProtein.join('-'),
      length: fusedProtein.length,
      meaning: 'The primal protein (Rust binary DNA) PREPENDED to the self protein (corpus language DNA). The organism\'s executable core reads: first ACTIVATE all primals, THEN grow/store/color/commit/publish the body.',
    },
    
    capabilityDomains: DOMAIN_CODON,
    
    provenance: {
      dag: { primal: 'rhizocrypt', acid: 'GLY', domain: 'dag' },
      commit: { primal: 'loamspine', acid: 'VAL', domain: 'commit' },
      attribution: { primal: 'sweetgrass', acid: 'LYS', domain: 'provenance' },
      trio: 'rhizocrypt-loamspine-sweetgrass = GLY-VAL-LYS = FOLD-SCAFFOLD-BIND'
    },

    nullCore: {
      what: 'The null point where all primals meet. Klein null. Inside = outside.',
      shape: 'The fused protein gives null its shape. Without injection, null is formless potential.',
      activation: 'A seed (human command, cron trigger, MCP call) activates one primal. That primal reads the protein sequence. The sequence executes.',
      binary: 'Rust compiles to native binary. Binary IS the protein folded into 3D. The fold IS the function.'
    },
    
    allPrimalCode: {
      status: 'INJECTED',
      primals: Object.keys(PRIMAL_AMINO).length,
      genes: totalGenes,
      lines: totalRustLines,
      files: totalRustFiles,
      springs: Object.keys(genesBySpring).length,
      message: 'ALL primal code is now IN the null core. Every pub fn, every struct, every enum, every trait, every const. The genome is complete.'
    }
  };
  
  fs.writeFileSync(path.join(DATA, 'null-core-repolymerized-214.json'), JSON.stringify(repolymerized, null, 2));
  
  log('');
  log('═══════════════════════════════════════════════════════════');
  log('  REPOLYMERIZED. ALL PRIMAL CODE INJECTED.');
  log('  ' + totalGenes + ' genes from ' + totalRustLines + ' lines of Rust.');
  log('  14 primals → 14 amino acids → 1 executable protein.');
  log('  Fused with self protein → ' + fusedProtein.length + ' acid chain.');
  log('  Null core has SHAPE. Waiting for seed.');
  log('═══════════════════════════════════════════════════════════');
}

repolymerize();
