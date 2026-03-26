import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL must be set");
}

const pool = new Pool({
  connectionString: databaseUrl,
  max: 1,
  connectionTimeoutMillis: 5000,
});

async function main() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS media_assets (
      id serial PRIMARY KEY,
      title text NOT NULL,
      media_type text NOT NULL,
      original_filename text,
      storage_url text NOT NULL,
      remote_storage_url text,
      storage_provider text,
      thumbnail_url text,
      alt_text text,
      description text,
      mime_type text,
      file_size_bytes integer,
      duration_seconds integer,
      width integer,
      height integer,
      exercise_focus text,
      body_region text,
      equipment text,
      difficulty text,
      tags jsonb,
      uploaded_by_role text,
      uploaded_by_user_id text,
      is_published boolean NOT NULL DEFAULT true,
      created_at timestamp NOT NULL DEFAULT now(),
      updated_at timestamp NOT NULL DEFAULT now()
    );
  `);

  await pool.query(`
    ALTER TABLE media_assets
    ADD COLUMN IF NOT EXISTS original_filename text,
    ADD COLUMN IF NOT EXISTS remote_storage_url text,
    ADD COLUMN IF NOT EXISTS storage_provider text,
    ADD COLUMN IF NOT EXISTS uploaded_by_role text,
    ADD COLUMN IF NOT EXISTS uploaded_by_user_id text;
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS media_assets_media_type_idx
    ON media_assets (media_type);
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS media_assets_exercise_focus_idx
    ON media_assets (exercise_focus);
  `);

  console.log("media_assets table is ready");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
