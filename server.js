const http = require('http');
const https = require('https');
const url = require('url');

const PORT = process.env.PORT || 3000;

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
  const { customer_id, level, since, until } = parsed.query;

  if (!customer_id) {
    res.writeHead(400, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({ error: 'Falta customer_id' }));
    return;
  }

  const APPS_SCRIPT = `https://script.google.com/macros/s/AKfycbxcowU_GWpXJX-_PN5dz0ERQ137w2P9D5JTV6NDZstUXLz2LDqoH0jmR3kZA044ak8/exec?customer_id=${customer_id}&level=${level||'campaign'}&since=${since}&until=${until}`;

  fetchUrl(APPS_SCRIPT, (err, data) => {
    if (err) {
      res.writeHead(500, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({ error: err.message }));
      return;
    }
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(data);
  });
});

server.listen(PORT, () => console.log(`Proxy corriendo en puerto ${PORT}`));
