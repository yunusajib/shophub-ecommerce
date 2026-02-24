const { Pool } = require("pg");

// Use DATABASE_URL if available (Render + Neon)
const isProduction = !!process.env.DATABASE_URL;

const pool = new Pool(
    isProduction
        ? {
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false }, // required for Neon
        }
        : {
            user: process.env.DB_USER || "postgres",
            host: process.env.DB_HOST || "localhost",
            database: process.env.DB_NAME || "shophub",
            password: process.env.DB_PASSWORD || "",
            port: process.env.DB_PORT || 5432,
        }
);

// Test connection
pool.on("connect", () => {
    console.log("✅ Connected to PostgreSQL database");
});

pool.on("error", (err) => {
    console.error("❌ Database error:", err);
});

// Helper function
const query = async (text, params) => {
    try {
        const res = await pool.query(text, params);
        return res;
    } catch (error) {
        console.error("Query error:", error);
        throw error;
    }
};

// Transaction helper
const transaction = async (callback) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const result = await callback(client);
        await client.query("COMMIT");
        return result;
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};

module.exports = { query, transaction, pool };
