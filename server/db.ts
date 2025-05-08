import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configure WebSockets for Neon database in serverless environments
neonConfig.webSocketConstructor = ws;

// Check for database URL
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Create connection pool and drizzle instance
export const pool = new Pool({ 
  connectionString: databaseUrl,
  // For serverless environments (like Vercel)
  max: 1,
  connectionTimeoutMillis: 5000,
});

// Create and export the database client
export const db = drizzle({ client: pool, schema });