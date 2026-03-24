import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configure WebSockets for Neon database in serverless environments
neonConfig.webSocketConstructor = ws;

// Check for database URL
const databaseUrl = process.env.DATABASE_URL;
export const hasDatabase = Boolean(databaseUrl);

// Create connection pool and drizzle instance
export const pool = hasDatabase
  ? new Pool({
      connectionString: databaseUrl,
      // For serverless environments (like Vercel)
      max: 1,
      connectionTimeoutMillis: 5000,
    })
  : null;

// Create and export the database client
export const db = hasDatabase && pool ? drizzle({ client: pool, schema }) : null;
