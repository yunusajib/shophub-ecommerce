const fs = require('fs');
let content = fs.readFileSync('server.js', 'utf8');

// Fix user login - make it async
content = content.replace(
    "app.post('/api/auth/login', (req, res) => {",
    "app.post('/api/auth/login', async (req, res) => {"
);

// Fix vendor login - make it async
content = content.replace(
    "app.post('/api/vendors/login', (req, res) => {",
    "app.post('/api/vendors/login', async (req, res) => {"
);

// Fix admin login - make it async
content = content.replace(
    "app.post('/api/admin/login', (req, res) => {",
    "app.post('/api/admin/login', async (req, res) => {"
);

fs.writeFileSync('server.js', content);
console.log('✅ Fixed! All login routes are now async');
