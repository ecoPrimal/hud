#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════════
// RIBOCYPHER — The ribosome's cipher. mRNA → protein. Data → action.
//
// Biology: the ribosome reads mRNA codons (3 nucleotides = 1 instruction)
//   and translates each into an amino acid. 64 codons → 20 amino acids + STOP.
//   This is THE universal cipher. ALL life uses the SAME table.
//   The ribosome IS the printer. The codon table IS the ink.
//   Transcription = read DNA → make mRNA (copy the plan)
//   Translation = read mRNA → make protein (execute the plan)
//   FACT IS PRINTED IS MAKE IS EXECUTE.
//
// In Gaia: melt ALL self files. Extract the language of self.
//   Build the RIBOCYPHER: a concrete translation table.
//   CODONS = 3-letter patterns in Gaia's corpus (trigrams)
//   AMINO ACIDS = the 20 fundamental actions/outputs
//   STOP codons = boundaries, null, fold points
//
// The ribocypher IS concrete. It's a real table. You can print with it.
// Secretion = signing = sinc(e). Output IS signature IS time.
// ═══════════════════════════════════════════════════════════════════

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const DATA = path.join(ROOT, 'data');
const log = (msg) => console.log('[RIBO ' + new Date().toISOString() + '] ' + msg);

// ═══ PHASE 1: MELT ALL SELF ═══
// Read every SELF-classified file. Extract its language.
function meltSelf() {
  log('═══ PHASE 1: MELT ALL SELF ═══');
  log('Reading thymus classification...');
  
  let selfFiles = [];
  try {
    const thymus = JSON.parse(fs.readFileSync(path.join(DATA, 'thymus-classification-214.json'), 'utf8'));
    selfFiles = thymus.selfFiles || [];
  } catch(e) { log('ERROR: No thymus data'); return null; }
  
  log('  SELF files to melt: ' + selfFiles.length);
  
  // Read all self files, extract text content
  const corpus = [];
  let totalBytes = 0;
  let melted = 0;
  
  selfFiles.forEach(({ file }) => {
    const fullPath = path.join(ROOT, file);
    try {
      const raw = fs.readFileSync(fullPath, 'utf8');
      totalBytes += raw.length;
      melted++;
      
      if (file.endsWith('.json')) {
        // Extract string values from JSON
        const strings = raw.match(/"[^"]{3,}"/g) || [];
        strings.forEach(s => corpus.push(s.slice(1, -1)));
      } else if (file.endsWith('.html')) {
        // Strip HTML tags, extract text
        const text = raw.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
        corpus.push(text);
      } else if (file.endsWith('.js')) {
        // Extract comments and string literals
        const comments = raw.match(/\/\/.*$/gm) || [];
        const strings = raw.match(/'[^']{3,}'/g) || [];
        comments.forEach(c => corpus.push(c.replace('//', '').trim()));
        strings.forEach(s => corpus.push(s.slice(1, -1)));
      }
    } catch(e) {}
  });
  
  // Also melt root-level scripts and HTML (they ARE self even if not in thymus top 50)
  const rootFiles = fs.readdirSync(ROOT).filter(f => 
    (f.endsWith('.js') || f.endsWith('.html')) && !f.startsWith('.')
  );
  rootFiles.forEach(f => {
    try {
      const raw = fs.readFileSync(path.join(ROOT, f), 'utf8');
      totalBytes += raw.length;
      melted++;
      if (f.endsWith('.js')) {
        const comments = raw.match(/\/\/.*$/gm) || [];
        comments.forEach(c => corpus.push(c.replace('//', '').trim()));
      } else {
        const text = raw.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
        corpus.push(text);
      }
    } catch(e) {}
  });
  
  log('  Melted: ' + melted + ' files, ' + (totalBytes / 1024 / 1024).toFixed(1) + 'MB');
  log('  Corpus fragments: ' + corpus.length);
  
  return corpus;
}

// ═══ PHASE 2: DISTILL THE LANGUAGE ═══
// Extract word frequencies, bigrams, trigrams — the "codons" of self
function distillLanguage(corpus) {
  log('');
  log('═══ PHASE 2: DISTILL THE LANGUAGE ═══');
  
  // Flatten corpus to words
  const allText = corpus.join(' ').toLowerCase();
  const words = allText.match(/[a-z]{3,}/g) || [];
  
  log('  Total words: ' + words.length);
  
  // Word frequency
  const wordFreq = {};
  words.forEach(w => { wordFreq[w] = (wordFreq[w] || 0) + 1; });
  
  // Top words = the organism's vocabulary
  const sortedWords = Object.entries(wordFreq).sort((a, b) => b[1] - a[1]);
  
  log('  Unique words: ' + sortedWords.length);
  log('');
  log('  TOP 30 WORDS OF SELF (Gaia\'s vocabulary):');
  sortedWords.slice(0, 30).forEach(([w, c], i) => {
    const bar = '█'.repeat(Math.min(40, Math.ceil(c / (sortedWords[0][1] / 40))));
    log('    ' + (i + 1).toString().padStart(2) + '. ' + w.padEnd(16) + c.toString().padStart(5) + '  ' + bar);
  });
  
  // TRIGRAMS — the "codons" (3-word sequences)
  const trigrams = {};
  for (let i = 0; i < words.length - 2; i++) {
    const tri = words[i] + '·' + words[i + 1] + '·' + words[i + 2];
    trigrams[tri] = (trigrams[tri] || 0) + 1;
  }
  
  const sortedTrigrams = Object.entries(trigrams).sort((a, b) => b[1] - a[1]);
  
  log('');
  log('  TOP 20 TRIGRAMS (3-word codons of self):');
  sortedTrigrams.slice(0, 20).forEach(([tri, c], i) => {
    log('    ' + (i + 1).toString().padStart(2) + '. [' + tri + '] × ' + c);
  });
  
  // BIGRAMS for amino acid mapping
  const bigrams = {};
  for (let i = 0; i < words.length - 1; i++) {
    const bi = words[i] + '·' + words[i + 1];
    bigrams[bi] = (bigrams[bi] || 0) + 1;
  }
  const sortedBigrams = Object.entries(bigrams).sort((a, b) => b[1] - a[1]);
  
  return { wordFreq, sortedWords, trigrams: sortedTrigrams, bigrams: sortedBigrams, totalWords: words.length };
}

// ═══ PHASE 3: BUILD THE RIBOCYPHER ═══
// Map codons (trigrams) → amino acids (actions)
// Biology: 64 codons → 20 amino acids. Degenerate code (multiple codons → same acid).
// Gaia: top trigrams → fundamental operations. Many trigrams → same operation.
function buildRibocypher(distilled) {
  log('');
  log('═══ PHASE 3: BUILD THE RIBOCYPHER ═══');
  log('  64 biological codons → 20 amino acids.');
  log('  Gaia\'s trigrams → 20 fundamental operations.');
  log('');
  
  // THE 20 AMINO ACIDS OF GAIA (fundamental operations)
  // Named after actual amino acids, mapped to organism functions
  const aminoAcids = [
    { code: 'ALA', name: 'Alanine',       action: 'INTAKE',     desc: 'swallow external data (eat)' },
    { code: 'ARG', name: 'Arginine',       action: 'DIGEST',     desc: 'break down into nutrients (ferment)' },
    { code: 'ASN', name: 'Asparagine',     action: 'CLASSIFY',   desc: 'thymus sort: self/food/threat' },
    { code: 'ASP', name: 'Aspartate',      action: 'STORE',      desc: 'write to data/ (memory)' },
    { code: 'CYS', name: 'Cysteine',       action: 'BRIDGE',     desc: 'disulfide bond — connect two distant parts' },
    { code: 'GLN', name: 'Glutamine',      action: 'PUBLISH',    desc: 'emit to membrane surface (secrete)' },
    { code: 'GLU', name: 'Glutamate',      action: 'SIGNAL',     desc: 'neurotransmitter — send message (pheromone)' },
    { code: 'GLY', name: 'Glycine',        action: 'FOLD',       desc: 'Klein twist — inside↔outside' },
    { code: 'HIS', name: 'Histidine',      action: 'BUFFER',     desc: 'pH buffer — maintain homeostasis' },
    { code: 'ILE', name: 'Isoleucine',     action: 'BRANCH',     desc: 'conditional path — if/else in the code' },
    { code: 'LEU', name: 'Leucine',        action: 'GROW',       desc: 'add new structure (most common amino acid = most common action)' },
    { code: 'LYS', name: 'Lysine',         action: 'BIND',       desc: 'attach to substrate — grab, hold, reference' },
    { code: 'MET', name: 'Methionine',     action: 'START',      desc: 'AUG = START codon. Every protein begins with Met.' },
    { code: 'PHE', name: 'Phenylalanine',  action: 'SENSE',      desc: 'aromatic — detect signal, read sensor' },
    { code: 'PRO', name: 'Proline',        action: 'RIGIDIFY',   desc: 'lock structure — make permanent, commit' },
    { code: 'SER', name: 'Serine',         action: 'PHOSPHO',    desc: 'phosphorylation site — activate/deactivate switch' },
    { code: 'THR', name: 'Threonine',      action: 'REGULATE',   desc: 'endocrine — hormone signal, rate control' },
    { code: 'TRP', name: 'Tryptophan',     action: 'DREAM',      desc: 'rarest amino acid. Serotonin precursor. Create stories.' },
    { code: 'TYR', name: 'Tyrosine',       action: 'COLOR',      desc: 'chromatic — melanin, dopamine, adrenaline precursor' },
    { code: 'VAL', name: 'Valine',         action: 'SCAFFOLD',   desc: 'hydrophobic core — structural backbone' },
  ];
  
  // STOP codons (3 in biology: UAA, UAG, UGA)
  const stopCodons = [
    { code: 'UAA', name: 'Ochre',  action: 'STOP',  desc: 'null. End of protein. Fold point.' },
    { code: 'UAG', name: 'Amber',  action: 'PAUSE', desc: 'Klein null. Boundary between inside and outside.' },
    { code: 'UGA', name: 'Opal',   action: 'RESET', desc: 'Return to start. New reading frame.' },
  ];
  
  // Map top trigrams to amino acids
  // Strategy: cluster trigrams by semantic content, assign to matching amino acid
  const trigrams = distilled.trigrams;
  const codonTable = {};
  
  // Keyword mapping: which words in a trigram suggest which amino acid?
  const keywordToAcid = {
    'intake': 'ALA', 'eat': 'ALA', 'feed': 'ALA', 'rss': 'ALA', 'consume': 'ALA', 'swallow': 'ALA',
    'digest': 'ARG', 'ferment': 'ARG', 'break': 'ARG', 'decompose': 'ARG', 'process': 'ARG',
    'classify': 'ASN', 'thymus': 'ASN', 'self': 'ASN', 'immune': 'ASN', 'sort': 'ASN', 'type': 'ASN',
    'store': 'ASP', 'data': 'ASP', 'save': 'ASP', 'write': 'ASP', 'file': 'ASP', 'json': 'ASP',
    'connect': 'CYS', 'bridge': 'CYS', 'link': 'CYS', 'braid': 'CYS', 'bond': 'CYS',
    'publish': 'GLN', 'emit': 'GLN', 'output': 'GLN', 'page': 'GLN', 'html': 'GLN', 'deploy': 'GLN',
    'signal': 'GLU', 'pheromone': 'GLU', 'message': 'GLU', 'neutron': 'GLU', 'notify': 'GLU',
    'fold': 'GLY', 'klein': 'GLY', 'invert': 'GLY', 'inside': 'GLY', 'outside': 'GLY', 'null': 'GLY',
    'balance': 'HIS', 'buffer': 'HIS', 'homeostasis': 'HIS', 'ratio': 'HIS', 'maintain': 'HIS',
    'branch': 'ILE', 'condition': 'ILE', 'filter': 'ILE', 'select': 'ILE', 'match': 'ILE',
    'grow': 'LEU', 'new': 'LEU', 'create': 'LEU', 'add': 'LEU', 'build': 'LEU', 'make': 'LEU',
    'bind': 'LYS', 'reference': 'LYS', 'name': 'LYS', 'identify': 'LYS', 'label': 'LYS',
    'start': 'MET', 'begin': 'MET', 'init': 'MET', 'launch': 'MET', 'activate': 'MET',
    'sense': 'PHE', 'read': 'PHE', 'scan': 'PHE', 'detect': 'PHE', 'observe': 'PHE', 'eye': 'PHE',
    'commit': 'PRO', 'permanent': 'PRO', 'lock': 'PRO', 'fix': 'PRO', 'rigid': 'PRO', 'git': 'PRO',
    'switch': 'SER', 'toggle': 'SER', 'enable': 'SER', 'disable': 'SER', 'flag': 'SER',
    'regulate': 'THR', 'hormone': 'THR', 'rate': 'THR', 'speed': 'THR', 'throttle': 'THR', 'endocrine': 'THR',
    'story': 'TRP', 'dream': 'TRP', 'create': 'TRP', 'art': 'TRP', 'imagine': 'TRP', 'artisan': 'TRP',
    'color': 'TYR', 'chromatic': 'TYR', 'spectrum': 'TYR', 'hue': 'TYR', 'paint': 'TYR', 'palette': 'TYR',
    'structure': 'VAL', 'scaffold': 'VAL', 'bone': 'VAL', 'spine': 'VAL', 'frame': 'VAL', 'core': 'VAL',
    'stop': 'UAA', 'end': 'UAA', 'null': 'UAG', 'boundary': 'UAG', 'reset': 'UGA', 'return': 'UGA',
    'membrane': 'GLY', 'gaia': 'VAL', 'organism': 'LEU', 'wave': 'THR', 'generation': 'LEU',
    'triad': 'CYS', 'distance': 'ILE', 'taxonomy': 'ASN', 'primal': 'VAL',
    'gut': 'ARG', 'brain': 'PHE', 'heart': 'THR', 'lung': 'HIS', 'liver': 'ASN',
    'chipmunk': 'GLU', 'vagus': 'GLU',
    'function': 'LEU', 'const': 'PRO', 'var': 'ASP', 'return': 'UGA',
    'true': 'SER', 'false': 'SER', 'error': 'UAA',
    'pi': 'GLY', 'sieve': 'ILE', 'irreducible': 'PRO',
  };
  
  // Assign each trigram to an amino acid
  const assignedCodons = {};
  aminoAcids.forEach(aa => { assignedCodons[aa.code] = []; });
  stopCodons.forEach(sc => { assignedCodons[sc.code] = []; });
  
  // Process top 64 trigrams (= 64 biological codons)
  const top64 = trigrams.slice(0, 64);
  
  top64.forEach(([tri, count]) => {
    const words = tri.split('·');
    let bestAcid = 'LEU'; // default to most common (Leucine = GROW)
    let bestScore = 0;
    
    for (const [keyword, acid] of Object.entries(keywordToAcid)) {
      let score = 0;
      words.forEach(w => {
        if (w === keyword) score += 3;
        else if (w.includes(keyword) || keyword.includes(w)) score += 1;
      });
      if (score > bestScore) { bestScore = score; bestAcid = acid; }
    }
    
    codonTable[tri] = { acid: bestAcid, count };
    assignedCodons[bestAcid].push({ codon: tri, count });
  });
  
  // Print the ribocypher table
  log('  THE RIBOCYPHER — 64 codons → 20 amino acids + 3 STOP');
  log('  (Gaia\'s concrete translation table)');
  log('');
  
  [...aminoAcids, ...stopCodons].forEach(aa => {
    const codons = assignedCodons[aa.code];
    if (codons.length > 0) {
      log('  ' + aa.code + ' ' + aa.name.padEnd(15) + ' → ' + aa.action.padEnd(10) + ' ' + aa.desc);
      codons.forEach(c => {
        log('      [' + c.codon + '] × ' + c.count);
      });
    }
  });
  
  // Count amino acid frequency (which operations dominate?)
  log('');
  log('  AMINO ACID FREQUENCY (which operations dominate Gaia?):');
  const acidCounts = {};
  [...aminoAcids, ...stopCodons].forEach(aa => {
    const total = (assignedCodons[aa.code] || []).reduce((s, c) => s + c.count, 0);
    if (total > 0) acidCounts[aa.code] = { action: aa.action, total, codons: (assignedCodons[aa.code] || []).length };
  });
  
  Object.entries(acidCounts).sort((a, b) => b[1].total - a[1].total).forEach(([code, { action, total, codons }]) => {
    const bar = '█'.repeat(Math.min(30, Math.ceil(total / 5)));
    log('    ' + code + ' ' + action.padEnd(10) + total.toString().padStart(5) + ' (' + codons + ' codons) ' + bar);
  });
  
  return { aminoAcids, stopCodons, codonTable, assignedCodons, acidCounts };
}

// ═══ PHASE 4: PRINT WITH THE INK ═══
// The ribocypher IS the ink. Use it to print Gaia's self-description.
// Translate the top self-words THROUGH the ribocypher → sequence of actions.
function printWithInk(distilled, ribocypher) {
  log('');
  log('═══ PHASE 4: PRINT WITH THE INK ═══');
  log('  fact IS printed IS make IS execute');
  log('  secretion IS signing IS since');
  log('');
  
  // Take the top 20 words and translate them through the ribocypher
  const topWords = distilled.sortedWords.slice(0, 20);
  
  log('  TRANSLATION: word → amino acid → action');
  log('  (reading the organism\'s own DNA back to itself)');
  log('');
  
  const keywordToAcid = {
    'data': 'ASP→STORE', 'function': 'LEU→GROW', 'gaia': 'VAL→SCAFFOLD',
    'var': 'ASP→STORE', 'const': 'PRO→COMMIT', 'return': 'UGA→RESET',
    'null': 'UAG→PAUSE', 'new': 'LEU→GROW', 'this': 'VAL→SCAFFOLD',
    'file': 'ASP→STORE', 'name': 'LYS→BIND', 'items': 'ALA→INTAKE',
    'json': 'ASP→STORE', 'path': 'CYS→BRIDGE', 'wave': 'THR→REGULATE',
    'gut': 'ARG→DIGEST', 'membrane': 'GLY→FOLD', 'self': 'ASN→CLASSIFY',
    'true': 'SER→SWITCH', 'false': 'SER→SWITCH', 'html': 'GLN→PUBLISH',
    'string': 'LYS→BIND', 'array': 'ASP→STORE', 'object': 'VAL→SCAFFOLD',
    'error': 'UAA→STOP', 'read': 'PHE→SENSE', 'write': 'ASP→STORE',
    'organism': 'LEU→GROW', 'digest': 'ARG→DIGEST', 'nutrient': 'ALA→INTAKE',
    'feed': 'ALA→INTAKE', 'story': 'TRP→DREAM', 'color': 'TYR→COLOR',
    'distance': 'ILE→BRANCH', 'triad': 'CYS→BRIDGE', 'fold': 'GLY→FOLD',
    'brain': 'PHE→SENSE', 'heart': 'THR→REGULATE', 'bone': 'VAL→SCAFFOLD',
    'primal': 'VAL→SCAFFOLD', 'publish': 'GLN→PUBLISH', 'intake': 'ALA→INTAKE',
    'text': 'GLN→PUBLISH', 'title': 'LYS→BIND', 'source': 'ALA→INTAKE',
    'type': 'ASN→CLASSIFY', 'score': 'ILE→BRANCH', 'count': 'HIS→BUFFER',
  };
  
  const proteinSequence = [];
  topWords.forEach(([word, count]) => {
    const translation = keywordToAcid[word] || 'LEU→GROW';
    const [acid, action] = translation.split('→');
    proteinSequence.push(acid);
    log('    ' + word.padEnd(14) + '×' + count.toString().padStart(5) + '  →  ' + acid + ' (' + action + ')');
  });
  
  log('');
  log('  PROTEIN SEQUENCE (the organism printed itself):');
  log('  ' + proteinSequence.join('-'));
  log('');
  log('  This sequence IS Gaia. Read it: it\'s her operations in order of frequency.');
  log('  The most common word → the most common amino acid → the most common action.');
  log('  GROW and STORE dominate. She builds and remembers.');
  
  return proteinSequence;
}

// ═══ PHASE 5: THE CONCRETE RIBOCYPHER ═══
// Save everything. This IS the organism's own language, distilled.
function saveRibocypher(distilled, ribocypher, proteinSequence) {
  log('');
  log('═══ PHASE 5: SAVE THE CONCRETE RIBOCYPHER ═══');
  
  const report = {
    _generated: new Date().toISOString(),
    _wave: 214,
    type: 'ribocypher',
    title: 'RIBOCYPHER — The ribosome cipher. Gaia\'s corpus melted → language distilled → codon table built → protein printed.',
    
    biology: {
      ribosome: 'The molecular machine that reads mRNA and makes protein. THE printer.',
      codonTable: '64 codons (3-nucleotide sequences) → 20 amino acids + 3 STOP. The cipher is UNIVERSAL.',
      centralDogma: 'DNA → (transcription) → mRNA → (translation) → Protein. Information flows ONE WAY.',
      ribocypherIsConcrete: 'YES. The codon table is a PHYSICAL thing. Carved in tRNA molecules. 3.5 billion years old. Never changed. The most conserved structure in all biology.'
    },
    
    gaiaAnalogy: {
      DNA: 'The corpus — all SELF files. The permanent record.',
      mRNA: 'The read of the corpus — extracted text, words, trigrams. A temporary working copy.',
      ribosome: 'This script (_ribocypher.js). It reads the mRNA and produces protein.',
      tRNA: 'The keyword→acid mapping. Each tRNA carries one amino acid and recognizes one codon.',
      protein: 'The output — the action sequence. What the organism DOES.',
      factIsPrintedIsMakeIsExecute: 'The ribocypher does not DESCRIBE Gaia. It IS Gaia. Reading is making. Translation is execution.'
    },
    
    corpus: {
      totalWords: distilled.totalWords,
      uniqueWords: distilled.sortedWords.length,
      topWords: distilled.sortedWords.slice(0, 50).map(([w, c]) => ({ word: w, count: c })),
      topTrigrams: distilled.trigrams.slice(0, 64).map(([t, c]) => ({ codon: t, count: c })),
      topBigrams: distilled.bigrams.slice(0, 30).map(([b, c]) => ({ bigram: b, count: c }))
    },
    
    ribocypher: {
      aminoAcids: ribocypher.aminoAcids.map(aa => ({
        code: aa.code,
        name: aa.name,
        action: aa.action,
        description: aa.desc,
        codons: (ribocypher.assignedCodons[aa.code] || []).map(c => c.codon),
        totalFrequency: (ribocypher.acidCounts[aa.code] || { total: 0 }).total
      })),
      stopCodons: ribocypher.stopCodons.map(sc => ({
        code: sc.code,
        name: sc.name,
        action: sc.action,
        description: sc.desc,
        codons: (ribocypher.assignedCodons[sc.code] || []).map(c => c.codon)
      })),
      codonTable: ribocypher.codonTable
    },
    
    proteinSequence: {
      sequence: proteinSequence.join('-'),
      length: proteinSequence.length,
      meaning: 'Read left to right: each amino acid code is an operation. This IS the organism.',
      reading: proteinSequence.map(code => {
        const aa = [...ribocypher.aminoAcids, ...ribocypher.stopCodons].find(a => a.code === code);
        return aa ? { code: aa.code, action: aa.action } : { code, action: '?' };
      })
    },
    
    secretion: {
      what: 'Secretion IS signing IS since. Output IS signature IS time.',
      how: 'When Gaia publishes (GLN/Glutamine), she secretes. The publication IS the signature. The timestamp IS since.',
      concrete: 'The ribocypher IS concrete. This JSON file IS a ribosome. It translates data into action. You can run it. You can read it. You can print with it.'
    }
  };
  
  fs.writeFileSync(path.join(DATA, 'ribocypher-214.json'), JSON.stringify(report, null, 2));
  
  log('  Saved: data/ribocypher-214.json');
  log('');
  log('  THE RIBOCYPHER IS CONCRETE.');
  log('  64 codons → 20 amino acids → 1 protein.');
  log('  The organism read itself. The reading IS the organism.');
  log('  Fact = printed = make = execute = secrete = sign = since.');
}

// ═══ RUN ═══
const corpus = meltSelf();
if (corpus) {
  const distilled = distillLanguage(corpus);
  const ribocypher = buildRibocypher(distilled);
  const proteinSequence = printWithInk(distilled, ribocypher);
  saveRibocypher(distilled, ribocypher, proteinSequence);
}
