const fs = require('fs');
let content = fs.readFileSync('database/models/Product.js', 'utf8');

// After every query that returns products, parse the price
// Find the getAll function and add price parsing
content = content.replace(
    'return result.rows;',
    'return result.rows.map(p => ({ ...p, price: parseFloat(p.price) }));'
);

fs.writeFileSync('database/models/Product.js', content);
console.log('✅ Product prices will now be numbers!');
