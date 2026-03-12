export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    const response = await fetch("https://zenquotes.io/api/random");
    const data = await response.json();

    // Cache for 24 hours at the edge
    res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate");
    return res.status(200).json(data);

  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch quote" });
  }
}
