const fs = require('fs');
let content = fs.readFileSync('server.js', 'utf8');

// Find and fix the newUser object in register to hash password
content = content.replace(
    `const newUser = {
            id: users.length + 1,
            name,
            email,
            password: await bcrypt.hash(password, 10),
            createdAt: new Date()
        };`,
    `const hashedPwd = await bcrypt.hash(password, 10);
        const newUser = {
            id: users.length + 1,
            name,
            email,
            password: hashedPwd,
            createdAt: new Date()
        };`
);

// Also try alternative format
content = content.replace(
    `const newUser = {
            id: users.length + 1,
            name,
            email,
            password,
            createdAt: new Date()
        };`,
    `const hashedPwd = await bcrypt.hash(password, 10);
        const newUser = {
            id: users.length + 1,
            name,
            email,
            password: hashedPwd,
            createdAt: new Date()
        };`
);

fs.writeFileSync('server.js', content);
console.log('✅ Register fixed!');
