const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const outDir = process.argv[2] ? path.resolve(process.argv[2]) : path.join(rootDir, '_site');

if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
}

function markdownToHtml(md) {
    const lines = md.split('\n');
    let inList = false;
    const out = [];

    for (let rawLine of lines) {
        let line = rawLine
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        // Check for list items
        const listMatch = line.match(/^(\s*)[*-]\s+(.*)$/);
        if (listMatch) {
            if (!inList) {
                out.push('<ul>');
                inList = true;
            }
            let itemContent = listMatch[2]
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/`([^`]+)`/g, '<code>$1</code>')
                .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
            out.push(`  <li>${itemContent}</li>`);
            continue;
        } else if (inList) {
            out.push('</ul>');
            inList = false;
        }

        // Headings
        if (line.startsWith('### ')) {
            out.push(`<h3>${line.slice(4)}</h3>`);
            continue;
        }
        if (line.startsWith('## ')) {
            out.push(`<h2>${line.slice(3)}</h2>`);
            continue;
        }
        if (line.startsWith('# ')) {
            out.push(`<h1>${line.slice(2)}</h1>`);
            continue;
        }

        // Horizontal rule
        if (line.trim() === '---') {
            out.push('<hr>');
            continue;
        }

        // Empty line
        if (!line.trim()) {
            continue;
        }

        // Paragraph line
        let p = line
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

        out.push(`<p>${p}</p>`);
    }

    if (inList) {
        out.push('</ul>');
    }

    return out.join('\n');
}

function wrapHtml(title, bodyHtml) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} — Dodge Block Dogs (DBD)</title>
    <link rel="icon" type="image/png" href="./favicon.png">
    <style>
        :root {
            --bg: #0c0f1d;
            --card: #151a30;
            --cyan: #00f0ff;
            --gold: #ffd700;
            --green: #05ffa1;
            --text: #e2e8f0;
            --muted: #a0aec0;
            --border: #232a4a;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            background-color: var(--bg);
            color: var(--text);
            font-family: 'Courier New', Courier, monospace, system-ui, -apple-system, sans-serif;
            line-height: 1.6;
            padding: 32px 16px 48px;
            display: flex;
            justify-content: center;
        }
        .doc-container {
            max-width: 760px;
            width: 100%;
            background: var(--card);
            border: 2px solid var(--border);
            border-radius: 14px;
            padding: 32px 28px;
            box-shadow: 0 12px 36px rgba(0,0,0,0.5);
        }
        .back-nav {
            margin-bottom: 24px;
        }
        .back-nav a {
            display: inline-block;
            color: var(--cyan);
            text-decoration: none;
            font-weight: bold;
            font-size: 0.95rem;
            padding: 8px 16px;
            border: 1.5px solid var(--cyan);
            border-radius: 8px;
            background: rgba(0, 240, 255, 0.08);
            transition: all 0.15s ease;
        }
        .back-nav a:hover {
            background: var(--cyan);
            color: #081018;
            transform: translateY(-1px);
        }
        h1 { color: var(--gold); margin-bottom: 12px; font-size: 1.8rem; border-bottom: 2px solid var(--border); padding-bottom: 10px; }
        h2 { color: var(--cyan); margin-top: 26px; margin-bottom: 10px; font-size: 1.25rem; }
        h3 { color: var(--green); margin-top: 18px; margin-bottom: 8px; font-size: 1.05rem; }
        p { margin-bottom: 14px; font-size: 0.92rem; }
        ul { margin-left: 24px; margin-bottom: 16px; font-size: 0.92rem; }
        li { margin-bottom: 6px; }
        a { color: var(--cyan); word-break: break-all; }
        code { background: rgba(255,255,255,0.08); padding: 2px 6px; border-radius: 4px; color: #f6e05e; font-size: 0.88em; }
        hr { border: 0; height: 1px; background: var(--border); margin: 22px 0; }
        strong { color: #fff; }
        footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid var(--border); text-align: center; color: var(--muted); font-size: 0.82rem; }
    </style>
</head>
<body>
    <div class="doc-container">
        <div class="back-nav">
            <a href="./">← Volver al Lanzador / Back to Launcher</a>
        </div>
        ${bodyHtml}
        <footer>
            &copy; 2026 Miguel Delgado Veliz &mdash; Dodge Block Dogs (DBD)
        </footer>
    </div>
</body>
</html>`;
}

// Convert Privacy Policy
const privacySrc = path.join(rootDir, 'PRIVACY_POLICY.md');
if (fs.existsSync(privacySrc)) {
    const md = fs.readFileSync(privacySrc, 'utf8');
    const html = wrapHtml('Privacy Policy', markdownToHtml(md));
    const dest = path.join(outDir, 'privacy.html');
    fs.writeFileSync(dest, html, 'utf8');
    console.log(`Generated: ${dest} (${fs.statSync(dest).size} bytes)`);
}

// Convert Terms of Service
const termsSrc = path.join(rootDir, 'TERMS_OF_SERVICE.md');
if (fs.existsSync(termsSrc)) {
    const md = fs.readFileSync(termsSrc, 'utf8');
    const html = wrapHtml('Terms of Service', markdownToHtml(md));
    const dest = path.join(outDir, 'terms.html');
    fs.writeFileSync(dest, html, 'utf8');
    console.log(`Generated: ${dest} (${fs.statSync(dest).size} bytes)`);
}

console.log('Documentation build completed successfully!');
