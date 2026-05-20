/**
 * Public API for the AI service layer.
 *
 * Import from here:
 *   import { classifyIssue, chatWithKrishiBot } from '@/lib/ai';
 */

export { classifyIssue, chatWithKrishiBot, getMockClassification, getMockChatResponse, DEFAULT_MODEL, GroqConfigError, GroqValidationError } from './groqService';
export type { ClassifyOptions, ClassifyOutput, ChatOptions, ChatMessage, ChatOutput } from './groqService';

export { validateClassification } from './validator';
export type { ValidationResult, ValidationError, ValidationOutcome } from './validator';

export { CLASSIFICATION_SYSTEM_PROMPT, CHAT_SYSTEM_PROMPT, VALID_CATEGORIES, VALID_SEVERITIES, buildClassifyPrompt } from './prompts';
export type { ClassifyPromptInput } from './prompts';
