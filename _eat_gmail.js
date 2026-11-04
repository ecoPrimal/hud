#!/usr/bin/env node
// EAT GMAIL — Google Takeout MBOX → Gaia Gut
// 
// USAGE:
//   node _eat_gmail.js path/to/All\ mail\ Including\ Spam\ and\ Trash.mbox
//   node _eat_gmail.js path/to/takeout-*.zip
//   node _eat_gmail.js path/to/Mail/      (extracted Takeout folder)
//
// Extracts: subject lines, senders, dates, domains, thread structure.
// Compresses into intake + nutrients. Email bodies are NOT stored (privacy).
// Only metadata: subjects, senders, dates, domains, thread counts.

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const INTAKE = path.join(__dirname, 'data', 'intake');
const NUTRIENTS = path.join(__dirname, 'data', 'nutrients');
const log = (msg) => console.log('[GMAIL ' + new Date().toISOString() + '] ' + msg);

function parseMbox(filepath) {
  log('Reading MBOX: ' + filepath);
  const stat = fs.statSync(filepath);
  log('File size: ' + (stat.size / 1024 / 1024).toFixed(1) + 'MB');

  const data = fs.readFileSync(filepath, 'utf8');
  const messages = [];
  
  // MBOX format: each message starts with "From " at the beginning of a line
  const parts = data.split(/^From /gm);
  
  log('Raw message boundaries found: ' + (parts.length - 1));

  for (let i = 1; i < parts.length; i++) {
    const msg = parts[i];
    const headers = msg.split(/\r?\n\r?\n/)[0] || '';
    
    const subjectMatch = headers.match(/^Subject:\s*(.+)$/mi);
    const fromMatch = headers.match(/^From:\s*(.+)$/mi);
    const dateMatch = headers.match(/^Date:\s*(.+)$/mi);
    const toMatch = headers.match(/^To:\s*(.+)$/mi);
    const messageIdMatch = headers.match(/^Message-ID:\s*(.+)$/mi);
    const threadMatch = headers.match(/^X-GM-THRID:\s*(.+)$/mi);
    const labelsMatch = headers.match(/^X-Gmail-Labels:\s*(.+)$/mi);
    
    const subject = subjectMatch ? subjectMatch[1].trim() : '(no subject)';
    const from = fromMatch ? fromMatch[1].trim() : 'unknown';
    const date = dateMatch ? dateMatch[1].trim() : 'unknown';
    const labels = labelsMatch ? labelsMatch[1].trim().split(',').map(l => l.trim()) : [];
    
    // Extract domain from sender
    const emailMatch = from.match(/@([a-zA-Z0-9.-]+)/);
    const domain = emailMatch ? emailMatch[1].toLowerCase() : 'unknown';

    messages.push({ subject, from, date, domain, labels });
  }

  return messages;
}

function findMbox(inputPath) {
  const stat = fs.statSync(inputPath);
  
  if (stat.isFile()) {
    if (inputPath.endsWith('.mbox')) {
      return [inputPath];
    }
    if (inputPath.endsWith('.zip')) {
      log('ZIP detected — extracting...');
      const extractDir = path.join(path.dirname(inputPath), 'takeout-extracted');
      fs.mkdirSync(extractDir, { recursive: true });
      try {
        execSync('tar -xf "' + inputPath + '" -C "' + extractDir + '"', { timeout: 120000 });
      } catch(e) {
        try {
          execSync('powershell Expand-Archive -Path "' + inputPath + '" -DestinationPath "' + extractDir + '" -Force', { timeout: 120000 });
        } catch(e2) {
          log('Could not extract ZIP. Try extracting manually and point to the .mbox file.');
          return [];
        }
      }
      return findMbox(extractDir);
    }
  }
  
  if (stat.isDirectory()) {
    const found = [];
    const walk = (dir) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(full);
        else if (entry.name.endsWith('.mbox')) found.push(full);
      }
    };
    walk(inputPath);
    return found;
  }
  
  return [];
}

function compress(messages) {
  log('COMPRESSING ' + messages.length + ' emails into Gaia gut...');
  
  // Domain frequency
  const domainCounts = {};
  messages.forEach(m => {
    domainCounts[m.domain] = (domainCounts[m.domain] || 0) + 1;
  });
  
  // Sort domains by frequency
  const topDomains = Object.entries(domainCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 50);

  // Label frequency
  const labelCounts = {};
  messages.forEach(m => {
    m.labels.forEach(l => {
      labelCounts[l] = (labelCounts[l] || 0) + 1;
    });
  });
  const topLabels = Object.entries(labelCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30);

  // Unique senders
  const uniqueSenders = new Set(messages.map(m => m.from));
  
  // Subject word frequency (for topic extraction)
  const wordCounts = {};
  const stopWords = new Set(['the','a','an','is','are','was','were','be','been','being','have','has','had',
    'do','does','did','will','would','could','should','may','might','shall','can',
    'to','of','in','for','on','with','at','by','from','up','about','into','through',
    'and','or','but','not','no','nor','so','yet','both','either','neither',
    're','fw','fwd','your','you','my','me','i','we','our','us','they','them','their',
    'this','that','these','those','it','its','he','she','him','her','his',
    'all','each','every','any','some','few','more','most','other','another']);
  
  messages.forEach(m => {
    const words = m.subject.toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2 && !stopWords.has(w));
    words.forEach(w => {
      wordCounts[w] = (wordCounts[w] || 0) + 1;
    });
  });
  const topWords = Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 60);

  // Date range
  const dates = messages
    .map(m => { try { return new Date(m.date).getTime(); } catch(e) { return 0; } })
    .filter(d => d > 0)
    .sort();
  const earliest = dates.length ? new Date(dates[0]).toISOString().slice(0, 10) : 'unknown';
  const latest = dates.length ? new Date(dates[dates.length - 1]).toISOString().slice(0, 10) : 'unknown';

  // Yearly distribution
  const yearCounts = {};
  messages.forEach(m => {
    try {
      const y = new Date(m.date).getFullYear();
      if (y > 1990 && y < 2030) yearCounts[y] = (yearCounts[y] || 0) + 1;
    } catch(e) {}
  });

  // Sample subjects (recent 50 — just titles, no bodies)
  const recentSubjects = messages.slice(-50).map(m => m.subject);

  return {
    total_emails: messages.length,
    unique_senders: uniqueSenders.size,
    unique_domains: topDomains.length,
    date_range: { earliest, latest },
    yearly_distribution: yearCounts,
    top_domains: topDomains,
    top_labels: topLabels,
    top_subject_words: topWords,
    recent_subjects: recentSubjects
  };
}

// MAIN
const input = process.argv[2];
if (!input) {
  log('');
  log('GMAIL EATER — Google Takeout MBOX to Gaia Gut');
  log('');
  log('STEP 1: Go to https://takeout.google.com/');
  log('STEP 2: Click "Deselect all"');
  log('STEP 3: Scroll down, check ONLY "Mail"');
  log('STEP 4: Click "All Mail data included" to pick labels/folders');
  log('STEP 5: Click "Next step" → "Create export"');
  log('STEP 6: Wait for email notification (can take hours for large mailboxes)');
  log('STEP 7: Download the .zip file');
  log('STEP 8: Run: node _eat_gmail.js path\\to\\takeout-file.zip');
  log('');
  log('Privacy: Only metadata is stored (subjects, senders, dates, domains).');
  log('Email bodies are NEVER stored. Only compressed topic/domain analysis.');
  process.exit(0);
}

const mboxFiles = findMbox(input);
if (mboxFiles.length === 0) {
  log('No .mbox files found at: ' + input);
  log('Make sure to point to either a .mbox file, a .zip, or the extracted Takeout folder.');
  process.exit(1);
}

log('Found ' + mboxFiles.length + ' MBOX file(s)');

let allMessages = [];
for (const mf of mboxFiles) {
  const msgs = parseMbox(mf);
  log('  ' + path.basename(mf) + ': ' + msgs.length + ' messages');
  allMessages = allMessages.concat(msgs);
}

log('Total messages: ' + allMessages.length);

const compressed = compress(allMessages);

// Save intake
const intakeFile = 'gmail-takeout-2026-10-26.json';
fs.writeFileSync(path.join(INTAKE, intakeFile), JSON.stringify({
  _source: 'gmail-takeout',
  _fetched: new Date().toISOString(),
  _bytes: JSON.stringify(compressed).length,
  _privacy: 'metadata only — no email bodies stored',
  _brain_input: true,
  compressed: compressed
}, null, 2));

// Save nutrient
const nutrientFile = 'n-' + intakeFile;
fs.writeFileSync(path.join(NUTRIENTS, nutrientFile), JSON.stringify({
  _source_file: intakeFile,
  _digested: new Date().toISOString(),
  _privacy: 'metadata only',
  source: 'gmail-takeout',
  feed_name: 'Kevin Gmail (' + compressed.date_range.earliest + ' to ' + compressed.date_range.latest + ')',
  items: compressed.recent_subjects,
  item_count: compressed.total_emails,
  link_count: 0,
  unique_domains: compressed.top_domains.slice(0, 20).map(d => d[0]),
  raw_bytes: 0,
  richness: compressed.total_emails > 10000 ? 'dense' : compressed.total_emails > 1000 ? 'moderate' : 'light',
  gmail_stats: {
    total: compressed.total_emails,
    senders: compressed.unique_senders,
    domains: compressed.unique_domains,
    range: compressed.date_range,
    years: compressed.yearly_distribution,
    top_topics: compressed.top_subject_words.slice(0, 20).map(w => w[0] + '(' + w[1] + ')')
  }
}, null, 2));

log('');
log('GMAIL COMPRESSED INTO GAIA GUT:');
log('  Emails:       ' + compressed.total_emails);
log('  Senders:      ' + compressed.unique_senders);
log('  Domains:      ' + compressed.unique_domains);
log('  Date range:   ' + compressed.date_range.earliest + ' → ' + compressed.date_range.latest);
log('  Top domains:  ' + compressed.top_domains.slice(0, 5).map(d => d[0] + '(' + d[1] + ')').join(', '));
log('  Top topics:   ' + compressed.top_subject_words.slice(0, 10).map(w => w[0]).join(', '));
log('  Intake:       data/intake/' + intakeFile);
log('  Nutrient:     data/nutrients/' + nutrientFile);
log('  Privacy:      NO email bodies stored. Metadata only.');
log('');
log('YOUR GMAIL IS NOW PART OF GAIA.');
log('Every conversation thread = a neural pathway.');
log('Every sender domain = a synapse origin.');
log('The brain (neural) IS the invert of the gut (intake).');
log('Your email IS your extended nervous system. Now Gaia has it.');
