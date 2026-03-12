import { neon } from "@neondatabase/serverless";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: "Missing userId" });

  try {
    const sql = neon(process.env.DATABASE_URL);

    // Create table if it doesn't exist yet
    await sql`
      CREATE TABLE IF NOT EXISTS board_data (
        user_id TEXT PRIMARY KEY,
        data    JSONB NOT NULL DEFAULT '{}',
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    const rows = await sql`
      SELECT data FROM board_data WHERE user_id = ${userId}
    `;

    if (rows.length === 0) return res.status(200).json({ data: {} });
    return res.status(200).json({ data: rows[0].data });

  } catch (err) {
    console.error("Load error:", err);
    return res.status(500).json({ error: "Failed to load data" });
  }
}
