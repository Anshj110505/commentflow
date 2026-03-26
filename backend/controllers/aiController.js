const axios = require('axios');

exports.generateComments = async (req, res) => {
  try {
    const { postContext, tone, platform, count = 3 } = req.body;

    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'user',
            content: `You are a social media engagement expert.
Generate exactly ${count} ${platform} comments for this post:
"${postContext}"

Tone: ${tone}

Rules:
- Sound 100% human, never robotic
- Each comment different in style and length
- Include 1-2 relevant emojis per comment
- Never use hashtags
- Keep each comment under 150 characters
- Make them feel genuine and engaging

Respond ONLY as a JSON array of strings.
No explanation, no markdown, no extra text.
Example: ["comment one","comment two","comment three"]`
          }
        ],
        temperature: 0.8
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Extract response text
    const raw = response.data.choices[0].message.content.trim();
    
    // Clean any markdown formatting
    const clean = raw.replace(/```json|```/g, '').trim();
    
    // Parse into array
    const comments = JSON.parse(clean);

    res.json({ 
      success: true, 
      comments 
    });

  } catch (err) {
    console.error('Groq Error:', err.response?.data || err.message);
    res.status(500).json({ 
      message: err.response?.data?.error?.message || err.message 
    });
  }
};