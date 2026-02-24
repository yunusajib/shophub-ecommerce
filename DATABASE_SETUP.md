# 🗄️ Database Setup Guide

## Prerequisites

Before setting up the database, make sure you have PostgreSQL installed on your system.

### Install PostgreSQL

**Windows:**
1. Download from: https://www.postgresql.org/download/windows/
2. Run the installer
3. Remember the password you set for the `postgres` user!

**Mac (using Homebrew):**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
```

This will install `pg` (PostgreSQL driver) and `dotenv` for environment variables.

### 2. Create the Database

Open terminal/command prompt and connect to PostgreSQL:

```bash
# Connect as postgres user
psql -U postgres

# In psql, create the database
CREATE DATABASE shophub;

# Exit psql
\q
```

**Alternative (if psql command doesn't work):**
- Open **pgAdmin** (installed with PostgreSQL)
- Right-click "Databases" → "Create" → "Database"
- Name it: `shophub`

### 3. Run the Schema

Run the SQL schema file to create all tables and insert demo data:

```bash
# Method 1: Using psql command
psql -U postgres -d shophub -f database/schema.sql

# Method 2: Using npm script
npm run db:setup
```

**Alternative (using pgAdmin):**
1. Open pgAdmin
2. Connect to your server
3. Select `shophub` database
4. Click "Query Tool"
5. Open `database/schema.sql`
6. Click "Execute" (F5)

### 4. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your database credentials:

```env
DB_USER=postgres
DB_HOST=localhost
DB_NAME=shophub
DB_PASSWORD=your_actual_password
DB_PORT=5432

PORT=3000
NODE_ENV=development
```

**⚠️ Important:** Replace `your_actual_password` with your PostgreSQL password!

### 5. Verify Database Setup

Connect to the database and check tables:

```bash
psql -U postgres -d shophub
```

```sql
-- List all tables
\dt

-- You should see:
-- users, vendors, products, orders, order_items, reviews, admin

-- Check data
SELECT * FROM vendors;
SELECT * FROM products;
SELECT * FROM users;

-- Exit
\q
```

### 6. Start the Server

```bash
npm start
```

You should see:
```
✅ Connected to PostgreSQL database
🚀 Server is running on http://localhost:3000
```

## Database Schema Overview

### Tables Created:

1. **users** - Customer accounts
2. **vendors** - Seller/shop accounts
3. **products** - Product catalog (linked to vendors)
4. **orders** - Customer orders
5. **order_items** - Individual items in orders (links orders to products)
6. **reviews** - Product reviews
7. **admin** - Platform administrators

### Demo Data Inserted:

- **1 Demo User**: demo@shophub.com / demo123
- **1 Demo Vendor**: vendor@shophub.com / vendor123
- **1 Admin**: admin@shophub.com / admin123
- **6 Products**: All owned by demo vendor
- **2 Reviews**: For the first product

## Common Issues & Solutions

### Issue 1: "psql: command not found"

**Solution:** Add PostgreSQL to your PATH

**Windows:**
- Add `C:\Program Files\PostgreSQL\15\bin` to System PATH

**Mac:**
```bash
echo 'export PATH="/usr/local/opt/postgresql@15/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### Issue 2: "password authentication failed"

**Solution:** Check your .env file password matches PostgreSQL password

### Issue 3: "database shophub does not exist"

**Solution:** Create the database first (see Step 2)

### Issue 4: "relation already exists"

**Solution:** The schema has already been run. To reset:

```sql
-- Connect to database
psql -U postgres -d shophub

-- Drop and recreate all tables
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

-- Exit and run schema again
\q
psql -U postgres -d shophub -f database/schema.sql
```

### Issue 5: Connection refused

**Solution:** Make sure PostgreSQL service is running

**Windows:**
- Open Services → Find "PostgreSQL" → Start

**Mac:**
```bash
brew services start postgresql@15
```

**Linux:**
```bash
sudo systemctl start postgresql
```

## Database Management Tools

### Recommended Tools:

1. **pgAdmin** (Free, comes with PostgreSQL)
   - Visual database management
   - Query tool
   - Easy table browsing

2. **DBeaver** (Free)
   - Cross-platform
   - Multi-database support
   - Professional interface

3. **TablePlus** (Paid, with free trial)
   - Modern UI
   - Fast and lightweight
   - Great for developers

## Testing the Database

### Test Queries:

```sql
-- Check total products
SELECT COUNT(*) FROM products;

-- Check all vendors
SELECT shop_name, email FROM vendors;

-- Get all products with vendor names
SELECT p.name, p.price, v.shop_name 
FROM products p 
JOIN vendors v ON p.vendor_id = v.id;

-- Check users
SELECT name, email FROM users;
```

## Backing Up Your Database

```bash
# Create backup
pg_dump -U postgres -d shophub > backup.sql

# Restore from backup
psql -U postgres -d shophub < backup.sql
```

## Next Steps

After database setup is complete:

1. ✅ Test the API endpoints
2. ✅ Login as demo user/vendor/admin
3. ✅ Create test orders
4. ✅ Add new products as vendor
5. ✅ Test all functionality

## Need Help?

If you encounter issues:

1. Check PostgreSQL is running: `pg_isready`
2. Check database exists: `psql -U postgres -l`
3. Verify .env file has correct credentials
4. Check server logs for error messages
5. Make sure port 5432 is not blocked by firewall

---

**🎉 Congratulations!** Your database is now set up and ready to use!
