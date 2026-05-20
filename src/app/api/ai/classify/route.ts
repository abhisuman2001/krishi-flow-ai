/**
 * POST /api/ai/classify
 *
 * Classifies a farmer's agricultural issue using Groq AI.
 *
 * Request body:
 * {
 *   "query"    : string  — farmer's problem description (Hindi or English) [required]
 *   "crop"     : string  — crop name (optional, improves accuracy)
 *   "language" : string  — preferred language code, e.g. "hi" | "en" (optional)
 *   "district" : string  — farmer's district (optional, improves context)
 *   "state"    : string  — farmer's state (optional, improves context)
 * }
 *
 * Success response (200):
 * {
 *   "classification": {
 *     "crop"           : string,
 *     "issueCategory"  : TicketCategory,
 *     "category"       : TicketCategory,   // mirror of issueCategory
 *     "severity"       : TicketSeverity,
 *     "department"     : string,
 *     "suggestedAction": string,
 *     "summary"        : string,
 *     "confidence"     : number
 *   },
 *   "processingTimeMs": number,
 *   "model"           : string,
 *   "isMock"          : boolean
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { classifyIssue, GroqValidationError } from '@/lib/ai';
import { connectDB } from '@/lib/db';
import AILogModel from '@/lib/models/AILog';

// ─── Input validation ─────────────────────────────────────────────────────────

interface ClassifyRequestBody {
  query?: unknown;
  /** Legacy field name — accepted as alias for query */
  issue?: unknown;
  crop?: unknown;
  language?: unknown;
  district?: unknown;
  state?: unknown;
}

function parseBody(body: ClassifyRequestBody): {
  query: string;
  crop: string;
  language: string;
  district: string;
  state: string;
} | { error: string; status: number } {
  // Accept both "query" (new) and "issue" (legacy) field names
  const rawQuery = body.query ?? body.issue;

  if (!rawQuery || typeof rawQuery !== 'string' || !rawQuery.trim()) {
    return {
      error: 'query is required and must be a non-empty string',
      status: 400,
    };
  }

  const query = rawQuery.trim();

  if (query.length < 5) {
    return {
      error: 'query must be at least 5 characters',
      status: 400,
    };
  }

  if (query.length > 2000) {
    return {
      error: 'query must not exceed 2000 characters',
      status: 400,
    };
  }

  return {
    query,
    crop:     typeof body.crop     === 'string' ? body.crop.trim()     : '',
    language: typeof body.language === 'string' ? body.language.trim() : '',
    district: typeof body.district === 'string' ? body.district.trim() : '',
    state:    typeof body.state    === 'string' ? body.state.trim()    : '',
  };
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  let rawBody: ClassifyRequestBody;

  // Parse request body
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Request body must be valid JSON' },
      { status: 400 }
    );
  }

  // Validate input
  const parsed = parseBody(rawBody);
  if ('error' in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: parsed.status });
  }

  const { query, crop, language, district, state } = parsed;

  try {
    // ── Call the AI service ──────────────────────────────────────────────────
    const result = await classifyIssue(
      { query, crop, language, district, state },
      { temperature: 0.2 }
    );

    // ── Persist AI log (fire-and-forget) ─────────────────────────────────────
    connectDB()
      .then(() =>
        AILogModel.create({
          ticketId:        'pending', // back-filled when the ticket is saved
          operation:       'classify',
          prompt:          result.prompt,
          response:        result.rawResponse,
          classification:  result.classification,
          model:           result.model,
          processingTimeMs: result.processingTimeMs,
          isMock:          result.isMock,
        })
      )
      .catch((err) => console.error('[AILog] save error:', err));

    // ── Return structured response ────────────────────────────────────────────
    return NextResponse.json({
      classification:   result.classification,
      processingTimeMs: result.processingTimeMs,
      model:            result.model,
      isMock:           result.isMock,
    });

  } catch (error) {
    // ── Validation error from the AI response ─────────────────────────────────
    if (error instanceof GroqValidationError) {
      console.error('[classify] AI validation error:', error.validationErrors);
      // Fall back to mock so the UI never breaks
      const { getMockClassification } = await import('@/lib/ai');
      const classification = getMockClassification(query, crop);
      return NextResponse.json({
        classification,
        processingTimeMs: 0,
        model:  'mock-fallback',
        isMock: true,
        warning: 'AI returned an invalid response; using rule-based fallback',
      });
    }

    // ── Any other error (network, quota, etc.) ────────────────────────────────
    console.error('[classify] error:', error);
    const { getMockClassification } = await import('@/lib/ai');
    const classification = getMockClassification(query, crop);
    return NextResponse.json({
      classification,
      processingTimeMs: 0,
      model:  'mock-fallback',
      isMock: true,
      warning: 'AI service unavailable; using rule-based fallback',
    });
  }
}
