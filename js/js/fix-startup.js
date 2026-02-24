const fs = require('fs');
let content = fs.readFileSync('server.js', 'utf8');

const startupCode = `
async function hashDemoPasswords() {
    for (let user of users) {
        if (!user.password.startsWith('$2b$')) {
            user.password = await bcrypt.hash(user.password, 10);
            console.log('Hashed password for:', user.email);
        }
    }
    for (let vendor of vendors) {
        if (!vendor.password.startsWith('$2b$')) {
            vendor.password = await bcrypt.hash(vendor.password, 10);
        }
    }
    if (!admin.password.startsWith('$2b$')) {
        admin.password = await bcrypt.hash(admin.password, 10);
    }
    console.log('✅ All demo passwords hashed!');
}
hashDemoPasswords();
`;

content = content.replace(
    "app.listen(PORT",
    startupCode + "app.listen(PORT"
);

fs.writeFileSync('server.js', content);
console.log('✅ Startup hashing added!');
