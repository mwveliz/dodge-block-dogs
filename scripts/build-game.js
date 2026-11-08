const fs = require('fs');
const path = require('path');

const templatePath = path.join(__dirname, '../src/game/index.template.html');
const threePath = path.join(__dirname, '../assets/three.min.js');
const gamePath = path.join(__dirname, '../src/game/game.js');

const gameHtmlDest = path.join(__dirname, '../assets/game.html');
const indexHtmlDest = path.join(__dirname, '../index.html');

console.log('Reading source files...');
const template = fs.readFileSync(templatePath, 'utf8');
const threeSource = fs.readFileSync(threePath, 'utf8');
const gameSource = fs.readFileSync(gamePath, 'utf8');

console.log('Assembling final HTML...');
const finalHtml = template
    .replace('/* THREE_JS_INLINE */', () => threeSource)
    .replace('/* GAME_JS_INLINE */', () => gameSource);

fs.writeFileSync(gameHtmlDest, finalHtml, 'utf8');
fs.writeFileSync(indexHtmlDest, finalHtml, 'utf8');

console.log('Build completed successfully!');
console.log('Destination sizes:');
console.log(' - assets/game.html:', fs.statSync(gameHtmlDest).size, 'bytes');
console.log(' - index.html:', fs.statSync(indexHtmlDest).size, 'bytes');
