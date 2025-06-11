const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const scoresPath = path.join(__dirname, 'scores.json');

function loadScores() {
  try {
    return JSON.parse(fs.readFileSync(scoresPath, 'utf8'));
  } catch (e) {
    return [];
  }
}

function saveScores(scores) {
  fs.writeFileSync(scoresPath, JSON.stringify(scores, null, 2));
}

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/scores') {
    const scores = loadScores();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(scores));
    return;
  }

  if (req.method === 'POST' && req.url === '/scores') {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        const newScore = JSON.parse(body);
        const scores = loadScores();
        scores.push({ name: newScore.name || 'Anon', score: newScore.score || 0 });
        scores.sort((a, b) => b.score - a.score);
        saveScores(scores.slice(0, 10));
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok' }));
      } catch (e) {
        res.writeHead(400);
        res.end('Invalid JSON');
      }
    });
    return;
  }

  // static files
  let filePath = '.' + req.url;
  if (filePath === './') {
    filePath = './index.html';
  }
  const extname = String(path.extname(filePath)).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
  };
  const contentType = mimeTypes[extname] || 'application/octet-stream';

  fs.readFile(path.join(__dirname, filePath), (err, content) => {
    if (err) {
      res.writeHead(404);
      res.end('Not Found');
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
