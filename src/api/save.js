import { neon } from "@neondatabase/serverless";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { userId, data } = req.body;
  if (!userId || data === undefined) return res.status(400).json({ error: "Missing userId or data" });

  try {
    const sql = neon(process.env.DATABASE_URL);

    // Upsert — insert or update if user already exists
    await sql`
      INSERT INTO board_data (user_id, data, updated_at)
      VALUES (${userId}, ${JSON.stringify(data)}, NOW())
      ON CONFLICT (user_id)
      DO UPDATE SET data = ${JSON.stringify(data)}, updated_at = NOW()
    `;

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error("Save error:", err);
    return res.status(500).json({ error: "Failed to save data" });
  }
}
