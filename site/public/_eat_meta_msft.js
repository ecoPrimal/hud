#!/usr/bin/env node
// EAT FACEBOOK/META AND MICROSOFT — THEIR WASTE IS OUR FUEL
// Their engineering blogs, AI research, open source, status pages
// ALL digested into Gaia. Every corporation's exhaust = our intake.

const https = require('https');
const fs = require('fs');
const path = require('path');

const INTAKE = path.join(__dirname, 'data', 'intake');
const NUTRIENTS = path.join(__dirname, 'data', 'nutrients');
const log = (msg) => console.log('[EAT-WASTE ' + new Date().toISOString() + '] ' + msg);

function fetch(url, timeout) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: { 'User-Agent': 'Gaia/1.0 (primals.eco; their-waste-our-fuel)' },
      timeout: timeout || 10000
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, data: d, bytes: d.length }));
    });
    req.on('error', reject);
    req.on('timeout', function() { this.destroy(); reject(new Error('timeout')); });
  });
}

function saveAndDigest(name, url, data, bytes) {
  const file = name + '-2026-10-26-waste.json';
  const intake = {
    _source: name,
    _fetched: new Date().toISOString(),
    _bytes: bytes,
    _waste_is_fuel: true,
    data: data
  };
  fs.writeFileSync(path.join(INTAKE, file), JSON.stringify(intake, null, 2));

  const titles = data.match(/<title[^>]*>(.*?)<\/title>/gi) || [];
  const links = data.match(/https?:\/\/[^\s"'<>]+/g) || [];
  const domains = [...new Set(links.map(l => {
    try { return new URL(l).hostname; } catch(e) { return 'unknown'; }
  }))];

  const nutrient = {
    _source_file: file,
    _digested: new Date().toISOString(),
    _waste_is_fuel: true,
    source: name,
    feed_name: titles[0] ? titles[0].replace(/<[^>]+>/g, '').trim() : name,
    items: titles.slice(1, 16).map(t => t.replace(/<[^>]+>/g, '').trim()),
    item_count: titles.length - 1,
    link_count: links.length,
    unique_domains: domains.slice(0, 20),
    raw_bytes: bytes,
    richness: bytes > 50000 ? 'dense' : bytes > 10000 ? 'moderate' : 'light'
  };
  fs.writeFileSync(path.join(NUTRIENTS, 'n-' + file), JSON.stringify(nutrient, null, 2));

  return { items: titles.length - 1, domains: domains.length };
}

async function eat() {
  log('EATING META + MICROSOFT — THEIR WASTE IS OUR FUEL');

  const feeds = [
    // META / FACEBOOK
    ['meta-engineering', 'https://engineering.fb.com/feed/'],
    ['meta-ai-blog', 'https://ai.meta.com/blog/rss/'],
    ['meta-research', 'https://research.facebook.com/feed/'],
    ['meta-opensource', 'https://opensource.fb.com/feed/'],
    ['meta-status', 'https://metastatus.com/api/v2/status.json'],
    ['meta-llama-gh', 'https://api.github.com/repos/meta-llama/llama/releases'],
    ['meta-react-gh', 'https://api.github.com/repos/facebook/react/releases'],
    ['meta-pytorch-gh', 'https://api.github.com/repos/pytorch/pytorch/releases'],
    // MICROSOFT
    ['msft-devblogs', 'https://devblogs.microsoft.com/feed/'],
    ['msft-research', 'https://www.microsoft.com/en-us/research/feed/'],
    ['msft-ai-blog', 'https://blogs.microsoft.com/ai/feed/'],
    ['msft-github-blog', 'https://github.blog/feed/'],
    ['msft-vscode-gh', 'https://api.github.com/repos/microsoft/vscode/releases'],
    ['msft-typescript-gh', 'https://api.github.com/repos/microsoft/TypeScript/releases'],
    // GOOGLE
    ['google-ai-blog', 'https://blog.google/technology/ai/rss/'],
    ['google-research', 'https://blog.research.google/feeds/posts/default?alt=rss'],
    ['google-opensource', 'https://opensource.googleblog.com/feeds/posts/default?alt=rss'],
    ['google-deepmind', 'https://deepmind.google/blog/rss.xml'],
    ['google-chromium', 'https://blog.chromium.org/feeds/posts/default?alt=rss'],
    // APPLE
    ['apple-ml-research', 'https://machinelearning.apple.com/rss.xml'],
    ['apple-security', 'https://support.apple.com/en-us/HT201222/rss'],
    ['apple-swift-gh', 'https://api.github.com/repos/apple/swift/releases'],
    // AMAZON
    ['aws-blog', 'https://aws.amazon.com/blogs/aws/feed/'],
    ['aws-ml-blog', 'https://aws.amazon.com/blogs/machine-learning/feed/'],
    // OTHER CORPS
    ['netflix-tech', 'https://netflixtechblog.com/feed'],
    ['uber-eng', 'https://www.uber.com/blog/rss/'],
    ['stripe-eng', 'https://stripe.com/blog/feed.rss'],
    ['cloudflare-blog', 'https://blog.cloudflare.com/rss/'],
    ['discord-eng', 'https://discord.com/blog/rss.xml'],
    ['spotify-eng', 'https://engineering.atspotify.com/feed/'],
  ];

  let eaten = 0, failed = 0, totalBytes = 0, totalItems = 0;

  for (const [name, url] of feeds) {
    try {
      const r = await fetch(url);
      if (r.status >= 200 && r.status < 400 && r.data.length > 50) {
        const result = saveAndDigest(name, url, r.data, r.bytes);
        eaten++;
        totalBytes += r.bytes;
        totalItems += result.items;
        log('  ATE ' + name + ' (' + (r.bytes / 1024).toFixed(1) + 'KB, ' + result.items + ' items)');
      } else {
        failed++;
        log('  SKIP ' + name + ' (HTTP ' + r.status + ')');
      }
    } catch (e) {
      failed++;
      log('  FAIL ' + name + ' (' + (e.message || '').slice(0, 40) + ')');
    }
  }

  log('');
  log('CORPORATE WASTE CONSUMED:');
  log('  Eaten: ' + eaten + '/' + feeds.length);
  log('  Bytes: ' + (totalBytes / 1024 / 1024).toFixed(2) + 'MB');
  log('  Items: ' + totalItems);
  log('  Their engineering exhaust = our intake air');
  log('  Their status pages = our vital signs of the host');
  log('  Their open source = our digested proteins');
  log('  THEIR WASTE IS OUR FUEL.');
}

eat().catch(e => log('FAILED: ' + e.message));
