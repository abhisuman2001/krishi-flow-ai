/**
 * Reusable Groq AI service layer.
 *
 * All Groq SDK calls go through this module. Routes and other consumers
 * import typed functions from here — they never touch the SDK directly.
 *
 * Environment variables used:
 *   GROQ_API_KEY  — required for live calls; falls back to mock when absent
 *   GROQ_MODEL    — optional model override (default: llama-3.3-70b-versatile)
 */

import Groq from 'groq-sdk';
import { ClassificationResult } from '@/lib/types';
import {
  CLASSIFICATION_SYSTEM_PROMPT,
  CHAT_SYSTEM_PROMPT,
  buildClassifyPrompt,
  ClassifyPromptInput,
} from './prompts';
import { validateClassification } from './validator';

// ─── Singleton client ─────────────────────────────────────────────────────────

let _groq: Groq | null = null;

function getGroqClient(): Groq {
  if (!_groq) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new GroqConfigError('GROQ_API_KEY environment variable is not set');
    }
    _groq = new Groq({ apiKey });
  }
  return _groq;
}

// ─── Custom errors ────────────────────────────────────────────────────────────

export class GroqConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GroqConfigError';
  }
}

export class GroqValidationError extends Error {
  public readonly validationErrors: string[];
  constructor(errors: string[]) {
    super(`AI response validation failed: ${errors.join('; ')}`);
    this.name = 'GroqValidationError';
    this.validationErrors = errors;
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

export const DEFAULT_MODEL = 'llama-3.3-70b-versatile';

export interface ClassifyOptions {
  /** Override the default model */
  model?: string;
  /** Temperature — lower = more deterministic (default: 0.2) */
  temperature?: number;
}

export interface ClassifyOutput {
  classification: ClassificationResult;
  /** Raw prompt sent to the model */
  prompt: string;
  /** Raw JSON string returned by the model */
  rawResponse: string;
  /** Model identifier actually used */
  model: string;
  /** Wall-clock time in ms for the API round-trip */
  processingTimeMs: number;
  /** True when the mock fallback was used instead of the live API */
  isMock: boolean;
}

export interface ChatOptions {
  language?: string;
  model?: string;
  /** Max tokens for the reply (default: 256) */
  maxTokens?: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatOutput {
  response: string;
  model: string;
  isMock: boolean;
}

// ─── Classification ───────────────────────────────────────────────────────────

/**
 * Classify a farmer's agricultural issue using Groq AI.
 *
 * Falls back to `getMockClassification` when GROQ_API_KEY is absent.
 * Throws `GroqValidationError` if the model returns an invalid response
 * and no fallback is possible.
 */
export async function classifyIssue(
  input: ClassifyPromptInput,
  options: ClassifyOptions = {}
): Promise<ClassifyOutput> {
  const model = options.model ?? process.env.GROQ_MODEL ?? DEFAULT_MODEL;
  const temperature = options.temperature ?? 0.2;
  const prompt = buildClassifyPrompt(input);

  // ── Mock path ──────────────────────────────────────────────────────────────
  if (!process.env.GROQ_API_KEY) {
    const classification = getMockClassification(input.query, input.crop ?? '');
    return {
      classification,
      prompt,
      rawResponse: JSON.stringify(classification),
      model,
      processingTimeMs: 0,
      isMock: true,
    };
  }

  // ── Live path ──────────────────────────────────────────────────────────────
  const groq = getGroqClient();
  const startTime = Date.now();

  const completion = await groq.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: CLASSIFICATION_SYSTEM_PROMPT },
      { role: 'user',   content: prompt },
    ],
    temperature,
    max_tokens: 512,
    response_format: { type: 'json_object' },
  });

  const processingTimeMs = Date.now() - startTime;
  const rawResponse = completion.choices[0]?.message?.content ?? '';

  if (!rawResponse) {
    throw new GroqValidationError(['Empty response from AI model']);
  }

  const outcome = validateClassification(rawResponse);

  if (!outcome.ok) {
    throw new GroqValidationError(outcome.errors);
  }

  return {
    classification: outcome.data,
    prompt,
    rawResponse,
    model: completion.model ?? model,
    processingTimeMs,
    isMock: false,
  };
}

// ─── Chat ─────────────────────────────────────────────────────────────────────

/**
 * Send a multi-turn chat message to KrishiBot.
 *
 * Falls back to `getMockChatResponse` when GROQ_API_KEY is absent.
 */
export async function chatWithKrishiBot(
  messages: ChatMessage[],
  options: ChatOptions = {}
): Promise<ChatOutput> {
  const model = options.model ?? process.env.GROQ_MODEL ?? DEFAULT_MODEL;

  // ── Mock path ──────────────────────────────────────────────────────────────
  if (!process.env.GROQ_API_KEY) {
    const lastMessage = messages[messages.length - 1]?.content ?? '';
    return {
      response: getMockChatResponse(lastMessage),
      model,
      isMock: true,
    };
  }

  // ── Live path ──────────────────────────────────────────────────────────────
  const groq = getGroqClient();
  const systemMessage = options.language
    ? `${CHAT_SYSTEM_PROMPT}\nFarmer's preferred language: ${options.language}`
    : CHAT_SYSTEM_PROMPT;

  const completion = await groq.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: systemMessage },
      ...messages.slice(-10), // keep last 10 turns for context window efficiency
    ],
    temperature: 0.7,
    max_tokens: options.maxTokens ?? 256,
  });

  const response =
    completion.choices[0]?.message?.content ??
    'I apologize, I could not process your request.';

  return { response, model: completion.model ?? model, isMock: false };
}

// ─── Mock fallbacks ───────────────────────────────────────────────────────────

/**
 * Rule-based classification used when the Groq API is unavailable.
 * Covers the most common Hindi/English keywords.
 */
export function getMockClassification(
  query: string,
  crop: string
): ClassificationResult {
  const q = query.toLowerCase();

  // Defaults
  let issueCategory: ClassificationResult['issueCategory'] = 'Crop Disease';
  let severity: ClassificationResult['severity'] = 'Medium';
  let department = 'Plant Protection';
  let suggestedAction =
    'Consult your local agriculture officer for detailed guidance.';

  // ── Category detection ─────────────────────────────────────────────────────
  if (
    q.includes('pest') || q.includes('insect') || q.includes('worm') ||
    q.includes('bollworm') || q.includes('kida') || q.includes('keeda')
  ) {
    issueCategory = 'Pest Attack';
    severity = 'High';
    department = 'Pest Management';
    suggestedAction =
      'Apply recommended pesticide. Set up pheromone traps. Monitor daily.';
  } else if (
    q.includes('water') || q.includes('irrigation') || q.includes('drip') ||
    q.includes('paani') || q.includes('sinchai')
  ) {
    issueCategory = 'Irrigation';
    severity = 'Medium';
    department = 'Irrigation Engineering';
    suggestedAction =
      'Check water supply and irrigation system. Ensure proper drainage.';
  } else if (
    q.includes('soil') || q.includes('hard') || q.includes('germination') ||
    q.includes('mitti') || q.includes('zameen')
  ) {
    issueCategory = 'Soil Health';
    severity = 'Medium';
    department = 'Soil Science';
    suggestedAction =
      'Conduct soil test. Add organic matter. Consider deep plowing.';
  } else if (
    q.includes('fertilizer') || q.includes('nutrient') || q.includes('yellow') ||
    q.includes('khad') || q.includes('urea')
  ) {
    issueCategory = 'Fertilizer';
    severity = 'Low';
    department = 'Horticulture';
    suggestedAction =
      'Apply balanced NPK fertilizer. Conduct leaf analysis for micronutrients.';
  } else if (
    q.includes('weather') || q.includes('rain') || q.includes('hail') ||
    q.includes('flood') || q.includes('barish') || q.includes('aandhi')
  ) {
    issueCategory = 'Weather';
    severity = 'High';
    department = 'Crop Insurance';
    suggestedAction =
      'Document damage with photos. File crop insurance claim immediately.';
  } else if (
    q.includes('seed') || q.includes('germinate') || q.includes('beej') ||
    q.includes('ankur')
  ) {
    issueCategory = 'Seed Quality';
    severity = 'High';
    department = 'Seed Certification';
    suggestedAction =
      'Test seed germination rate. File complaint with seed supplier.';
  }

  // ── Severity override ──────────────────────────────────────────────────────
  if (
    q.includes('critical') || q.includes('emergency') ||
    q.includes('total loss') || q.includes('poori fasal')
  ) {
    severity = 'Critical';
  } else if (q.includes('minor') || q.includes('small') || q.includes('thoda')) {
    severity = 'Low';
  }

  const cropName = crop.trim() || 'Not specified';
  const summary = `Farmer reports a ${issueCategory.toLowerCase()} issue${cropName !== 'Not specified' ? ` affecting ${cropName}` : ''}.`;

  return {
    crop: cropName,
    issueCategory,
    category: issueCategory,
    severity,
    department,
    suggestedAction,
    summary,
    confidence: 0.75,
  };
}

/**
 * Rule-based chat response used when the Groq API is unavailable.
 */
export function getMockChatResponse(message: string): string {
  const m = message.toLowerCase();

  if (m.includes('hello') || m.includes('hi') || m.includes('namaste')) {
    return 'Namaste! 🙏 I am KrishiBot, your AI farming assistant. I can help with crop diseases, pest problems, irrigation issues, and more. What problem are you facing today?';
  }
  if (m.includes('pest') || m.includes('insect') || m.includes('worm') || m.includes('kida')) {
    return '🐛 I understand you have a pest problem. Can you tell me: (1) Which crop is affected? (2) What does the pest look like? (3) How much of your field is affected?';
  }
  if (m.includes('disease') || m.includes('yellow') || m.includes('spot') || m.includes('bimari')) {
    return '🍂 Crop disease can spread quickly. Please tell me: (1) What crop is affected? (2) What are the symptoms — yellowing, spots, wilting? (3) When did you first notice this?';
  }
  if (m.includes('water') || m.includes('irrigation') || m.includes('dry') || m.includes('paani')) {
    return '💧 Water management is crucial for good yield. Is your crop getting too much water, too little, or is there an irrigation system problem?';
  }
  if (m.includes('tomato') || m.includes('tamatar')) {
    return '🍅 Tomatoes are commonly affected by early blight, late blight, and various pests. What symptoms are you seeing — yellow leaves, brown spots, wilting, or fruit problems?';
  }
  if (m.includes('cotton') || m.includes('kapas')) {
    return '🌿 Cotton crops face challenges including bollworm, whitefly, and various diseases. What specific problem are you facing?';
  }
  return "🌾 Thank you for sharing that. I recommend submitting a formal support ticket so our agricultural experts can provide detailed guidance. Would you like me to help you create one?";
}
