export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  res.status(200).json({
    configured: !!process.env.GEMINI_API_KEY
  });
}
