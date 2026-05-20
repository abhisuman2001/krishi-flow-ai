/**
 * Validation and sanitisation for raw AI JSON responses.
 *
 * The model occasionally returns:
 *  - extra wrapper keys  (e.g. { "result": { ... } })
 *  - wrong enum values   (e.g. "crop disease" instead of "Crop Disease")
 *  - missing fields
 *  - out-of-range confidence values
 *
 * This module normalises all of that into a clean ClassificationResult.
 */

import { ClassificationResult, TicketCategory, TicketSeverity } from '@/lib/types';
import { VALID_CATEGORIES, VALID_SEVERITIES } from './prompts';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ValidationResult {
  ok: true;
  data: ClassificationResult;
}

export interface ValidationError {
  ok: false;
  errors: string[];
}

export type ValidationOutcome = ValidationResult | ValidationError;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Case-insensitive match against the valid category list.
 * Returns the correctly-cased value or null.
 */
function normaliseCategory(raw: unknown): TicketCategory | null {
  if (typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  const match = VALID_CATEGORIES.find(
    (c) => c.toLowerCase() === trimmed.toLowerCase()
  );
  return match ?? null;
}

/**
 * Case-insensitive match against the valid severity list.
 */
function normaliseSeverity(raw: unknown): TicketSeverity | null {
  if (typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  const match = VALID_SEVERITIES.find(
    (s) => s.toLowerCase() === trimmed.toLowerCase()
  );
  return match ?? null;
}

/**
 * Clamp a number to [0, 1]. Returns 0.5 for non-numeric input.
 */
function normaliseConfidence(raw: unknown): number {
  const n = typeof raw === 'number' ? raw : parseFloat(String(raw));
  if (isNaN(n)) return 0.5;
  return Math.min(1, Math.max(0, n));
}

/**
 * Unwrap common model wrapping patterns like { "result": { ... } } or
 * { "classification": { ... } }.
 */
function unwrap(raw: Record<string, unknown>): Record<string, unknown> {
  const wrapperKeys = ['result', 'classification', 'output', 'data', 'response'];
  for (const key of wrapperKeys) {
    if (
      raw[key] !== null &&
      typeof raw[key] === 'object' &&
      !Array.isArray(raw[key])
    ) {
      return raw[key] as Record<string, unknown>;
    }
  }
  return raw;
}

// ─── Main validator ───────────────────────────────────────────────────────────

/**
 * Parse and validate a raw AI response string into a ClassificationResult.
 *
 * @param rawContent - The raw string returned by the model
 * @returns ValidationOutcome — either { ok: true, data } or { ok: false, errors }
 */
export function validateClassification(rawContent: string): ValidationOutcome {
  // 1. Parse JSON
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawContent);
  } catch {
    return { ok: false, errors: ['AI response is not valid JSON'] };
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return { ok: false, errors: ['AI response must be a JSON object'] };
  }

  // 2. Unwrap potential wrapper keys
  const obj = unwrap(parsed as Record<string, unknown>);

  const errors: string[] = [];

  // 3. Validate each field
  const crop =
    typeof obj.crop === 'string' && obj.crop.trim()
      ? obj.crop.trim()
      : 'Not specified';

  // issueCategory — accept both "issueCategory" and legacy "category" keys
  const rawCategory = obj.issueCategory ?? obj.category;
  const issueCategory = normaliseCategory(rawCategory);
  if (!issueCategory) {
    errors.push(
      `Invalid issueCategory "${rawCategory}". Must be one of: ${VALID_CATEGORIES.join(', ')}`
    );
  }

  const severity = normaliseSeverity(obj.severity);
  if (!severity) {
    errors.push(
      `Invalid severity "${obj.severity}". Must be one of: ${VALID_SEVERITIES.join(', ')}`
    );
  }

  const department =
    typeof obj.department === 'string' && obj.department.trim()
      ? obj.department.trim()
      : 'Agriculture Department';

  const suggestedAction =
    typeof obj.suggestedAction === 'string' && obj.suggestedAction.trim()
      ? obj.suggestedAction.trim()
      : 'Consult your local agriculture officer for guidance.';

  const summary =
    typeof obj.summary === 'string' && obj.summary.trim()
      ? obj.summary.trim()
      : suggestedAction; // fall back to suggestedAction if summary is missing

  const confidence = normaliseConfidence(obj.confidence);

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  // 4. Build the clean result
  const result: ClassificationResult = {
    crop,
    issueCategory: issueCategory!,
    category: issueCategory!,   // mirror for backward compatibility
    severity: severity!,
    department,
    suggestedAction,
    summary,
    confidence,
  };

  return { ok: true, data: result };
}
