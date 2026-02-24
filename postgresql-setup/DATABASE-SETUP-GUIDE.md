# 🗄️ PostgreSQL Setup Guide for ShopHub

## Quick Setup (5 minutes!)

### Step 1: Run the Database Schema

```bash
cd ~/Downloads/shophub-ecommerce

# Run the schema file
psql -d shophub -f setup-database.sql
```

You should see lots of "CREATE TABLE" and "INSERT" messages. That's good! ✅

---

### Step 2: Install PostgreSQL Driver

```bash
npm install pg dotenv
```

---

### Step 3: Create .env File

```bash
cat > .env << 'EOF'
DB_USER=postgres
DB_HOST=localhost
DB_NAME=shophub
DB_PASSWORD=
DB_PORT=5432
PORT=3000
EOF
```

**Note:** Leave `DB_PASSWORD=` blank if you didn't set a password during PostgreSQL installation.

---

### Step 4: Copy Database Files

The database folder with models needs to be in your project. Download it from the files I'm sharing.

Your folder structure should look like:
```
shophub-ecommerce/
├── database/
│   ├── db.js
│   └── models/
│       ├── User.js
│       ├── Vendor.js
│       ├── Product.js
│       ├── Order.js
│       ├── Review.js
│       └── Admin.js
├── server.js (your current server)
├── server-db.js (NEW - uses database)
├── setup-database.sql
├── .env
└── ... (all your HTML/CSS/JS files)
```

---

### Step 5: Test Database Connection

```bash
# Test if you can connect
psql -d shophub -c "SELECT * FROM users;"
```

Should show the demo user! ✅

---

### Step 6: Use the Database Server

```bash
# Stop the old server
kill -9 $(lsof -ti:3000)

# Start the database-enabled server
node server-db.js
```

You should see:
```
✅ Connected to PostgreSQL database
🚀 Server: http://localhost:3000
```

---

### Step 7: Test It Works!

1. **Open:** http://localhost:3000
2. **Login with demo account:**
   - Email: demo@shophub.com
   - Password: demo123
3. **Register a new user**
4. **Restart server:** `node server-db.js`
5. **Login with new user** - it still works! ✅

**Data is now permanent!** 🎉

---

## Verify Everything Works

```bash
# Check users (should see your new user!)
psql -d shophub -c "SELECT name, email FROM users;"

# Check products
psql -d shophub -c "SELECT name, price FROM products;"

# Check vendors
psql -d shophub -c "SELECT shop_name, email FROM vendors;"
```

---

## Troubleshooting

### "database shophub does not exist"
```bash
psql postgres -c "CREATE DATABASE shophub;"
```

### "connection refused"
- Make sure Postgres.app is running
- Check the elephant icon in your menu bar

### "password authentication failed"
- If you set a password, add it to .env: `DB_PASSWORD=your_password`
- Or reset: open Postgres.app → Server Settings

### "Cannot find module 'pg'"
```bash
npm install pg dotenv
```

---

## What Changed?

| Before (server.js) | After (server-db.js) |
|-------------------|---------------------|
| Data in memory | Data in PostgreSQL |
| Lost on restart | Saved forever |
| Arrays: `let users = []` | Database: `SELECT * FROM users` |
| No persistence | Full persistence |

---

## Commands Cheat Sheet

```bash
# Start server with database
node server-db.js

# View all users
psql -d shophub -c "SELECT * FROM users;"

# View all products
psql -d shophub -c "SELECT * FROM products;"

# View all orders
psql -d shophub -c "SELECT * FROM orders;"

# Reset database (delete all data)
psql -d shophub -f setup-database.sql

# Backup database
pg_dump shophub > backup.sql

# Restore database
psql -d shophub < backup.sql
```

---

🎉 **You now have a production-ready database!** 🎉
