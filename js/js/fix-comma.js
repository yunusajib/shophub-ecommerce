const fs = require('fs');
let content = fs.readFileSync('server.js', 'utf8');

// Fix missing comma after bcrypt.hash line
content = content.replace(
    'password: await bcrypt.hash(password, 10)\n        rating:',
    'password: await bcrypt.hash(password, 10),\n        rating:'
);

// Also fix if there are other missing commas after hash
content = content.replace(
    'password: await bcrypt.hash(password, 10)\n        createdAt:',
    'password: await bcrypt.hash(password, 10),\n        createdAt:'
);

fs.writeFileSync('server.js', content);
console.log('✅ Comma fixed!');
