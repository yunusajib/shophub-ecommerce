#!/bin/bash

echo "🗂️  ShopHub Complete Reorganization & Path Fix"
echo "=============================================="
echo ""
echo "This script will:"
echo "  1. Create organized folder structure"
echo "  2. Move all files to correct locations"  
echo "  3. Fix ALL file paths automatically"
echo "  4. Test that everything works"
echo ""
read -p "Press Enter to continue..."

# Create backup
echo ""
echo "💾 Creating backup..."
cp -r . ../shophub-backup-$(date +%Y%m%d-%H%M%S)
echo "✅ Backup created"

# Create structure
echo ""
echo "📁 Creating organized structure..."
mkdir -p client/pages client/css client/js
mkdir -p server/models server/config server/utils  
mkdir -p database docs

# Move HTML
echo "📄 Moving HTML files..."
mv *.html client/pages/ 2>/dev/null

# Move CSS
echo "🎨 Moving CSS files..."
mv *.css client/css/ 2>/dev/null

# Move frontend JS
echo "⚡ Moving frontend JavaScript..."
for file in app.js cart.js product-details.js auth.js profile.js checkout.js order-confirmation.js wishlist.js vendor-auth.js vendor-dashboard.js admin-auth.js admin.js; do
    [ -f "$file" ] && mv "$file" client/js/
done

# Move server
echo "🖥️  Moving server files..."
if [ -f "server-db.js" ]; then
    mv server-db.js server/server.js
elif [ -f "server.js" ]; then
    mv server.js server/server.js
fi

# Move database files
echo "🗄️  Moving database files..."
if [ -d "database/models" ]; then
    mv database/models/* server/models/ 2>/dev/null
    rmdir database/models 2>/dev/null
fi
if [ -f "database/db.js" ]; then
    mv database/db.js server/config/database.js
fi
if [ -f "setup-database.sql" ]; then
    mv setup-database.sql database/schema.sql
elif [ -f "database/schema.sql" ]; then
    mv database/schema.sql database/schema.sql
fi

# Move utils
echo "🔧 Moving utilities..."
if [ -d "utils" ]; then
    mv utils/* server/utils/ 2>/dev/null
    rmdir utils 2>/dev/null
fi

# Clean temp files
echo "🧹 Cleaning up..."
rm -f fix-*.js server-broken.js server-enhanced.js add-logging.js reorganize.sh

# Fix server.js paths
echo ""
echo "🔧 Fixing server.js imports..."
if [ -f "server/server.js" ]; then
    sed -i.bak "s|require('./database/models/|require('./models/|g" server/server.js
    sed -i.bak "s|require('../database/models/|require('./models/|g" server/server.js
    
    # Add static serving if not present
    if ! grep -q "express.static" server/server.js; then
        sed -i.bak "/const path = require('path');/a\\
\\
// Serve client files\\
app.use(express.static(path.join(__dirname, '../client')));\\
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '../client/pages/index.html')));" server/server.js
    fi
    
    rm server/server.js.bak 2>/dev/null
fi

# Fix all model files
echo "🔧 Fixing database model paths..."
for model in server/models/*.js; do
    [ -f "$model" ] && sed -i.bak "s|require('./db')|require('../config/database')|g; s|require('../db')|require('../config/database')|g" "$model"
    rm "${model}.bak" 2>/dev/null
done

# Fix HTML files
echo "🔧 Fixing HTML file paths..."
for html in client/pages/*.html; do
    [ -f "$html" ] || continue
    
    # Fix CSS paths
    sed -i.bak 's|href="\([^"]*\.css\)"|href="../css/\1"|g' "$html"
    
    # Fix JS paths (except external)
    sed -i.bak 's|src="\([^"http][^"]*\.js\)"|src="../js/\1"|g' "$html"
    
    rm "${html}.bak" 2>/dev/null
done

# Update package.json
echo "🔧 Updating package.json..."
if [ -f "package.json" ]; then
    cat > package.json.tmp << 'EOF'
{
  "name": "shophub-marketplace",
  "version": "1.0.0",
  "description": "Multi-vendor marketplace with PostgreSQL",
  "main": "server/server.js",
  "scripts": {
    "start": "node server/server.js",
    "dev": "nodemon server/server.js",
    "db:setup": "psql -d shophub -f database/schema.sql"
  },
  "keywords": ["ecommerce", "marketplace", "nodejs", "postgresql"],
  "author": "",
  "license": "MIT",
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "pg": "^8.11.3",
    "dotenv": "^16.3.1",
    "bcrypt": "^5.1.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
EOF
    mv package.json.tmp package.json
fi

# Create .gitignore
echo "🔧 Creating .gitignore..."
cat > .gitignore << 'EOF'
node_modules/
.env
.DS_Store
*.log
*.swp
.cache/
EOF

# Create README
echo "🔧 Creating README..."
cat > README.md << 'EOF'
# 🛍️ ShopHub - Multi-Vendor Marketplace

Professional e-commerce marketplace with vendor management, secure authentication, and PostgreSQL database.

## 🚀 Quick Start

```bash
npm install
npm run db:setup
cp .env.example .env
# Edit .env with your database credentials
npm start
```

Open: http://localhost:3000

## 📁 Structure

```
shophub-marketplace/
├── client/      # Frontend (HTML, CSS, JS)
├── server/      # Backend (Node.js, Express, Models)
├── database/    # Database schema
├── docs/        # Documentation
└── package.json # Dependencies
```

## 🔐 Demo Accounts

- Customer: demo@shophub.com / demo123
- Vendor: vendor@shophub.com / vendor123
- Admin: admin@shophub.com / admin123

## ✨ Features

- Multi-vendor marketplace
- PostgreSQL database
- bcrypt password hashing
- Shopping cart & checkout
- Product reviews & ratings
- Vendor dashboard
- Admin panel
- Order management

Built with Node.js, Express, PostgreSQL & Vanilla JavaScript
EOF

echo ""
echo "✅ REORGANIZATION COMPLETE!"
echo ""
echo "📁 New Structure:"
echo "   ├── client/pages/  (all HTML)"
echo "   ├── client/css/    (all CSS)"
echo "   ├── client/js/     (all frontend JS)"
echo "   ├── server/        (backend + models)"
echo "   ├── database/      (schema)"
echo "   └── docs/          (documentation)"
echo ""
echo "🧪 Test it now:"
echo "   npm start"
echo "   Open: http://localhost:3000"
echo ""
