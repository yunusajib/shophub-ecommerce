const fs = require('fs');
let content = fs.readFileSync('server-db.js', 'utf8');

// Add path require at top
if (!content.includes("const path = require('path')")) {
    content = content.replace(
        "const cors = require('cors');",
        "const cors = require('cors');\nconst path = require('path');"
    );
}

// Add static middleware after express.json()
if (!content.includes('express.static')) {
    content = content.replace(
        'app.use(express.json());',
        'app.use(express.json());\napp.use(express.static(path.join(__dirname)));'
    );
}

fs.writeFileSync('server-db.js', content);
console.log('✅ Static serving added!');
