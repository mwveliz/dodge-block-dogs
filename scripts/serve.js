const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8080;
const rootDir = path.join(__dirname, '..');
const indexPath = path.join(rootDir, 'index.html');

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.ico': 'image/x-icon',
    '.json': 'application/json'
};

const server = http.createServer((req, res) => {
    let reqPath = req.url.split('?')[0];
    if (reqPath === '/' || reqPath === '') {
        reqPath = '/index.html';
    }

    const filePath = path.join(rootDir, reqPath);

    // Prevent directory traversal
    if (!filePath.startsWith(rootDir)) {
        res.writeHead(403);
        res.end('Access Denied');
        return;
    }

    fs.readFile(filePath, (err, data) => {
        if (err) {
            // Fallback to index.html for SPA/game
            fs.readFile(indexPath, (err2, fallbackData) => {
                if (err2) {
                    res.writeHead(404);
                    res.end('Not Found');
                } else {
                    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                    res.end(fallbackData);
                }
            });
            return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    });
});

server.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 Dodge Block Dogs - Local Browser Server Running!`);
    console.log(`🎮 Play directly in your browser: http://localhost:${PORT}`);
    console.log(`Press Ctrl+C to stop.`);
    console.log(`======================================================\n`);
});
