import pg from "pg";

const { Client } = pg;
export const psqlClient = new Client({
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    host: process.env.PG_HOST || "127.0.0.1",
    port: parseInt(process.env.PG_PORT) || 5432,
    database: process.env.PG_DATABASE || "nin0chat"
});
psqlClient.connect();
