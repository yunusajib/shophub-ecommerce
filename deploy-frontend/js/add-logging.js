const fs = require('fs');
let content = fs.readFileSync('server-db.js', 'utf8');

// Replace the products route error handler
content = content.replace(
    `console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Failed to fetch products' });`,
    `console.error('Error fetching products:', error);
        console.error('Error details:', error.message);
        console.error('Stack:', error.stack);
        res.status(500).json({ message: 'Failed to fetch products', error: error.message });`
);

fs.writeFileSync('server-db.js', content);
console.log('✅ Better error logging added!');
