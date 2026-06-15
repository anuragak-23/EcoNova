export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { footprint, highestCategory } = req.body;
  if (!footprint || !highestCategory) {
    return res.status(400).json({ error: 'Missing required parameters: footprint and highestCategory' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Gemini API Key is not configured on the server. Please set the GEMINI_API_KEY environment variable.' });
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  
  const prompt = `You are EcoNova's AI Sustainability Coach. Analyze this user's carbon footprint data:
- Transport emissions: ${footprint.transport} tonnes CO₂/year
- Energy emissions: ${footprint.energy} tonnes CO₂/year
- Food emissions: ${footprint.food} tonnes CO₂/year
- Lifestyle emissions: ${footprint.lifestyle} tonnes CO₂/year
- Total footprint: ${footprint.total} tonnes CO₂/year
The highest emission category is: ${highestCategory}.

Provide a highly personalized sustainability report in HTML format.
Requirements:
1. Identify the highest emission category and summarize their profile in 2 short sentences.
2. Suggest exactly 5 concrete, actionable daily habits they can log to reduce emissions (use bullet points).
3. Estimate the total yearly CO₂ reduction (in tonnes) if they follow all 5 habits. Highlight this inside a card or banner.
Keep the output clean, modern, and structured in standard HTML tags (div, p, ul, li, strong). Do not return markdown block wrappers like \`\`\`html.`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API call failed:', errorText);
      return res.status(502).json({ error: 'Failed to fetch from Google Gemini API: ' + errorText });
    }

    const json = await response.json();
    if (!json.candidates || json.candidates.length === 0 || !json.candidates[0].content) {
      return res.status(502).json({ error: 'Invalid response from Google Gemini API.' });
    }

    let text = json.candidates[0].content.parts[0].text;
    text = text.replace(/```html/g, '').replace(/```/g, '').trim();

    return res.status(200).json({ text });
  } catch (error) {
    console.error('Server Gemini Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
