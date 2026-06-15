export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const isConfigured = 
    !!apiKey && 
    apiKey !== "" && 
    apiKey !== "YOUR_API_KEY" && 
    !apiKey.toLowerCase().includes("your_") && 
    !apiKey.toLowerCase().includes("placeholder");

  res.status(200).json({
    configured: isConfigured
  });
}
