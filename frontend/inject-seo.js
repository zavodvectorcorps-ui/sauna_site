#!/usr/bin/env node
/**
 * Injects SEO meta tags from backend API into index.html at startup.
 * Runs before React dev/build server starts.
 */
const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
const INDEX_PATH = path.join(__dirname, 'public', 'index.html');
const TEMPLATE_PATH = path.join(__dirname, 'public', 'index.template.html');

const DEFAULTS = {
  title: 'WM-Sauna | Producent Saun Drewnianych w Polsce',
  description: 'WM-Sauna - polski producent saun drewnianych premium.',
  keywords: 'sauna drewniana, producent saun, sauna beczka',
  og_image: '',
  canonical_url: 'https://wm-spa.pl',
};

function fetch(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    lib.get(url, { timeout: 10000 }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function main() {
  let seo = { ...DEFAULTS };

  // Try to fetch from backend API (with retries)
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const apiUrl = API_URL.includes('localhost')
        ? 'http://localhost:8001/api/settings/seo'
        : `${API_URL}/api/settings/seo`;
      const data = JSON.parse(await fetch(apiUrl));
      seo.title = data.title_pl || DEFAULTS.title;
      seo.description = data.description_pl || DEFAULTS.description;
      seo.keywords = data.keywords_pl || DEFAULTS.keywords;
      seo.canonical_url = data.canonical_url || DEFAULTS.canonical_url;

      // Build absolute OG image URL
      const ogImg = data.og_image || '';
      if (ogImg.startsWith('/api/')) {
        seo.og_image = `${seo.canonical_url}${ogImg}`;
      } else {
        seo.og_image = ogImg;
      }

      console.log('[SEO Inject] Fetched settings from API');
      break;
    } catch (e) {
      console.log(`[SEO Inject] Attempt ${attempt + 1}/5 failed: ${e.message}`);
      if (attempt < 4) await new Promise(r => setTimeout(r, 2000));
    }
  }

  // Read template and replace placeholders
  const templatePath = fs.existsSync(TEMPLATE_PATH) ? TEMPLATE_PATH : INDEX_PATH;
  let html = fs.readFileSync(templatePath, 'utf-8');

  html = html.replace(/__META_TITLE__/g, seo.title);
  html = html.replace(/__META_DESCRIPTION__/g, seo.description);
  html = html.replace(/__META_KEYWORDS__/g, seo.keywords);
  html = html.replace(/__META_CANONICAL__/g, seo.canonical_url);
  html = html.replace(/__META_OG_IMAGE__/g, seo.og_image);

  fs.writeFileSync(INDEX_PATH, html, 'utf-8');
  console.log(`[SEO Inject] Updated index.html:`);
  console.log(`  Title: ${seo.title}`);
  console.log(`  OG Image: ${seo.og_image}`);
  console.log(`  Canonical: ${seo.canonical_url}`);
}

main().catch(e => {
  console.error('[SEO Inject] Failed:', e.message);
  process.exit(0); // Don't block frontend startup
});
