const fs = require('fs');
let content = fs.readFileSync('app.js', 'utf8');

// Fix all fetch calls with wrong backtick placement
content = content.replace(/fetch`\$\{API_URL\}/g, 'fetch(`${API_URL}');

fs.writeFileSync('app.js', content);
console.log('✅ Fixed fetch syntax!');
