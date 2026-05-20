/**
 * POST /api/ai/chat
 *
 * Multi-turn chat with KrishiBot.
 *
 * Request body:
 * {
 *   "messages" : { role: "user" | "assistant", content: string }[]  [required]
 *   "language" : string  — preferred language code (optional)
 * }
 *
 * Success response (200):
 * {
 *   "response": string,
 *   "model"   : string,
 *   "isMock"  : boolean
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { chatWithKrishiBot } from '@/lib/ai';
import type { ChatMessage } from '@/lib/ai';

export async function POST(request: NextRequest) {
  let body: { messages?: unknown; language?: unknown };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Request body must be valid JSON' },
      { status: 400 }
    );
  }

  const { messages, language } = body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json(
      { error: 'messages must be a non-empty array' },
      { status: 400 }
    );
  }

  // Sanitise messages — only keep role + content, drop unknown fields
  const sanitised: ChatMessage[] = messages
    .filter(
      (m): m is { role: string; content: string } =>
        m !== null &&
        typeof m === 'object' &&
        typeof m.role === 'string' &&
        typeof m.content === 'string'
    )
    .map((m) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content.slice(0, 2000), // cap individual message length
    }));

  if (sanitised.length === 0) {
    return NextResponse.json(
      { error: 'No valid messages found in the messages array' },
      { status: 400 }
    );
  }

  try {
    const result = await chatWithKrishiBot(sanitised, {
      language: typeof language === 'string' ? language : undefined,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('[chat] error:', error);
    return NextResponse.json({
      response:
        'Namaste! I am KrishiBot. I am here to help you with your farming problems. Please tell me about your crop issue.',
      model:  'mock-fallback',
      isMock: true,
    });
  }
}
