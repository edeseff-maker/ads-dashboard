const http = require('http');
const https = require('https');
const url = require('url');

const PORT = process.env.PORT || 3000;

const META_TOKEN = 'EAAcKaV5ubwYBRQI0Tet1yF9wMks8NSZBFxR4jc8hyuAukRXZBAekxOY3FP2dXzkpH9G0ys6HsnPmZB4LXYCXNl05MUrKMiOeKGKGZAyMNYbmDZBgFVnqZBsZCaopaePAj8eyf5IxdQK9MosuBwENK6UOe6Y9GanuJ0o0i1zUIPFngZCPYbkIXvV9NM8eNywKmPsdmhIrSiR9xa64fO2ud7lvUMTTnHsnEbb2h8ANvG8c10FwuAX2ocazvoXgs79EKskxt2xBtd5cVXuXdKeHDgZDZD';
const META_ACCOUNT = 'act_881641562970222';

function fetchUrl(targetUrl, callback) {
  const parsed = url.parse(targetUrl);
  const options = {
    hostname: parsed.hostname,
    path: parsed.path,
    method: 'GET',
    headers: { 'User-Agent': 'Mozilla/5.0' }
  };

  https.get(options, (res) => {
    if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
      fetchUrl(res.headers.location, callback);
      return;
    }
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => callback(null, data));
  }).on('error', (e) => callback(e, null));
}

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsed = url.parse(req.url, true);
  const path = parsed.pathname;

  // Google Ads proxy
  if (path === '/' || path === '') {
    const { customer_id, level, since, until } = parsed.query;
    if (!customer_id) {
      res.writeHead(400, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({ error: 'Falta customer_id' }));
      return;
    }
    const APPS_SCRIPT = `https://script.google.com/macros/s/AKfycbxcowU_GWpXJX-_PN5dz0ERQ137w2P9D5JTV6NDZstUXLz2LDqoH0jmR3kZA044ak8/exec?customer_id=${customer_id}&level=${level||'campaign'}&since=${since}&until=${until}`;
    fetchUrl(APPS_SCRIPT, (err, data) => {
      if (err) { res.writeHead(500, {'Content-Type': 'application/json'}); res.end(JSON.stringify({ error: err.m
