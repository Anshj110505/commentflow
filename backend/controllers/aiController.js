const Anthropic = require('@anthropic-ai/sdk');

// Create Claude AI client using our API key from .env
const client = new Anthropic({ 
  apiKey: process.env.ANTHROPIC_API_KEY 
});

exports.generateComments = async (req, res) => {
  try {
    const { 
      postContext,      // description of the post
      tone,             // friendly, witty, professional etc
      platform,         // instagram or facebook
      count = 3         // how many comments to generate
    } = req.body;

    // Send request to Claude AI
    const message = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `You are a social media engagement expert.
Generate exactly ${count} ${platform} comments for this post:
"${postContext}"

Tone: ${tone}

Rules:
- Sound 100% human, never robotic or salesy
- Each comment should be different in style and length
- Include 1-2 relevant emojis per comment
- Never use hashtags
- Keep each comment under 150 characters
- Make them feel genuine and engaging

Respond ONLY as a JSON array of strings.
No explanation, no markdown, no extra text.
Example format: ["comment one","comment two","comment three"]`
      }]
    });

    // Parse the AI response
    const raw = message.content[0].text.trim();
    const comments = JSON.parse(raw);

    res.json({ 
      success: true,
      comments 
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};