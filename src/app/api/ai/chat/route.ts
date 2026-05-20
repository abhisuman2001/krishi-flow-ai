import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
});

const CHAT_SYSTEM_PROMPT = `You are KrishiBot, a helpful AI assistant for Indian farmers. 
You help farmers identify crop problems, provide agricultural advice, and guide them through the ticket submission process.

Guidelines:
- Be empathetic and supportive
- Use simple language (mix of Hindi/English is fine)
- Ask clarifying questions about: crop type, symptoms, location, duration
- After gathering enough info, suggest submitting a formal ticket
- Provide immediate actionable advice
- Keep responses concise (2-3 sentences max)
- End with a helpful follow-up question or action

You represent KrishiFlow AI - a government agricultural support platform.`;

export async function POST(request: NextRequest) {
  try {
    const { messages, language } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
    }

    if (!process.env.GROQ_API_KEY) {
      // Return mock response
      const lastMessage = messages[messages.length - 1]?.content || '';
      const mockResponse = getMockChatResponse(lastMessage);
      return NextResponse.json({ response: mockResponse, mock: true });
    }

    const systemMessage = `${CHAT_SYSTEM_PROMPT}\nFarmer's preferred language: ${language || 'Hindi/English'}`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemMessage },
        ...messages.slice(-10), // Keep last 10 messages for context
      ],
      temperature: 0.7,
      max_tokens: 256,
    });

    const response = completion.choices[0]?.message?.content || 'I apologize, I could not process your request.';

    return NextResponse.json({ response });
  } catch (error) {
    console.error('AI chat error:', error);
    return NextResponse.json({
      response: 'Namaste! I am KrishiBot. I am here to help you with your farming problems. Please tell me about your crop issue.',
      mock: true,
    });
  }
}

function getMockChatResponse(message: string): string {
  const msgLower = message.toLowerCase();

  if (msgLower.includes('hello') || msgLower.includes('hi') || msgLower.includes('namaste')) {
    return 'Namaste! 🙏 I am KrishiBot, your AI farming assistant. I can help you with crop diseases, pest problems, irrigation issues, and more. What problem are you facing with your crops today?';
  }

  if (msgLower.includes('pest') || msgLower.includes('insect') || msgLower.includes('worm')) {
    return '🐛 I understand you have a pest problem. This can be serious! Can you tell me: (1) Which crop is affected? (2) What does the pest look like? (3) How much of your field is affected? This will help me give you the right advice.';
  }

  if (msgLower.includes('disease') || msgLower.includes('yellow') || msgLower.includes('spot')) {
    return '🍂 Crop disease can spread quickly. Please tell me: (1) What crop is affected? (2) What are the symptoms - yellowing, spots, wilting? (3) When did you first notice this? I will help you identify the disease and suggest treatment.';
  }

  if (msgLower.includes('water') || msgLower.includes('irrigation') || msgLower.includes('dry')) {
    return '💧 Water management is crucial for good yield. Is your crop getting too much water, too little, or is there an irrigation system problem? Tell me more so I can help you find the right solution.';
  }

  if (msgLower.includes('tomato')) {
    return '🍅 Tomatoes are commonly affected by early blight, late blight, and various pests. What symptoms are you seeing? Yellow leaves, brown spots, wilting, or fruit problems? I can help diagnose the issue.';
  }

  if (msgLower.includes('cotton')) {
    return '🌿 Cotton crops face many challenges including bollworm, whitefly, and various diseases. What specific problem are you facing? I can guide you to the right solution and help you submit a support ticket if needed.';
  }

  return '🌾 Thank you for sharing that. Based on what you\'ve described, I recommend submitting a formal support ticket so our agricultural experts can provide detailed guidance. Would you like me to help you create a ticket? Please share your district and contact details.';
}
