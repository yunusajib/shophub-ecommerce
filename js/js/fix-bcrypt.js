const fs = require('fs');

let content = fs.readFileSync('server.js', 'utf8');

// 1. Add bcrypt at the top
if (!content.includes("require('bcrypt')")) {
    content = content.replace(
        "const express = require('express');",
        "const express = require('express');\nconst bcrypt = require('bcrypt');"
    );
    console.log('✅ bcrypt imported');
} else {
    console.log('ℹ️  bcrypt already imported');
}

// 2. Fix user registration - hash password
if (content.includes("password, // NOTE: In production, hash this with bcrypt")) {
    content = content.replace(
        "password, // NOTE: In production, hash this with bcrypt",
        "password: await bcrypt.hash(password, 10)"
    );
    console.log('✅ User registration password hashing fixed');
} else {
    console.log('ℹ️  User registration already updated');
}

// 3. Fix user login
if (content.includes("if (user.password !== password)")) {
    content = content.replace(
        "if (user.password !== password)",
        "const isValidUser = await bcrypt.compare(password, user.password);\n        if (!isValidUser)"
    );
    console.log('✅ User login fixed');
} else {
    console.log('ℹ️  User login already updated');
}

// 4. Fix vendor login
if (content.includes("if (vendor.password !== password)")) {
    content = content.replace(
        "if (vendor.password !== password)",
        "const isValidVendor = await bcrypt.compare(password, vendor.password);\n        if (!isValidVendor)"
    );
    console.log('✅ Vendor login fixed');
} else {
    console.log('ℹ️  Vendor login already updated');
}

// 5. Fix admin login
if (content.includes("if (email !== admin.email || password !== admin.password)")) {
    content = content.replace(
        "if (email !== admin.email || password !== admin.password)",
        "const isValidAdmin = await bcrypt.compare(password, admin.password);\n    if (email !== admin.email || !isValidAdmin)"
    );
    console.log('✅ Admin login fixed');
} else {
    console.log('ℹ️  Admin login already updated');
}

// Save file
fs.writeFileSync('server.js', content);
console.log('\n🎉 server.js updated successfully!');
console.log('Now run: node server.js');