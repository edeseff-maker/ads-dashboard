const http = require('http');
const https = require('https');
const url = require('url');

const PORT = process.env.PORT || 3000;

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

  const PROXY_URL = `https://script.google.com/macros/s/AKfycbxcowU_GWpXJX-_PN5dz0ERQ137w2P9D5JTV6NDZstUXLz2LDqoH0jmR3kZA044ak8/exec?customer_id=${customer_id}&level=${level||'campaign'}&since=${since}&until=${until}`;

  https.get(PROXY_URL, (proxyRes) => {
    let data = '';
    proxyRes.on('data', chunk => data += chunk);
    proxyRes.on('end', () => {
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(data);
    });
  }).on('error', (e) => {
    res.writeHead(500, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({ error: e.message }));
  });
});

server.listen(PORT, () => console.log(`Proxy corriendo en puerto ${PORT}`));
