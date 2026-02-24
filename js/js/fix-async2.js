const fs = require('fs');
let content = fs.readFileSync('server.js', 'utf8');

// Fix user register - make it async
content = content.replace(
    "app.post('/api/auth/register', (req, res) => {",
    "app.post('/api/auth/register', async (req, res) => {"
);

// Fix vendor register - make it async
content = content.replace(
    "app.post('/api/vendors/register', (req, res) => {",
    "app.post('/api/vendors/register', async (req, res) => {"
);

fs.writeFileSync('server.js', content);
console.log('✅ Fixed! Register routes are now async');
