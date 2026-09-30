import { BrandKit, CanvasElement, Design, Page } from '@designforge/core';

export type AIProviderName = 'openai' | 'anthropic' | 'gemini' | 'openrouter' | 'ollama' | 'custom_openai';

export interface ProviderConfig {
  provider: AIProviderName;
  apiKey?: string;
  baseUrl?: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AIMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  toolCallId?: string;
  toolCalls?: AIToolCall[];
}

export interface AIToolCall {
  id: string;
  name: string;
  arguments: Record<string, any>;
}

export interface AIToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, any>; // JSON schema
}

export interface AICompletionOptions {
  messages: AIMessage[];
  tools?: AIToolDefinition[];
  temperature?: number;
  maxTokens?: number;
  responseFormat?: 'text' | 'json';
}

export interface AICompletionResult {
  content: string;
  toolCalls?: AIToolCall[];
  provider: AIProviderName;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface MagicDesignPrompt {
  prompt: string;
  dimensions?: { width: number; height: number; name?: string };
  brandKit?: BrandKit;
  targetAudience?: string;
  category?: 'social' | 'presentation' | 'marketing' | 'print' | 'banner';
  language?: string;
}

export interface CopywritingPrompt {
  prompt: string;
  tone?: 'professional' | 'energetic' | 'minimal' | 'playful' | 'luxury' | 'bold';
  format?: 'headline' | 'tagline' | 'paragraph' | 'bullet_points' | 'cta' | 'social_caption';
  language?: string; // 'en', 'hi', 'es', 'fr', etc.
  existingText?: string;
}

export interface PresentationGenPrompt {
  topic: string;
  numSlides: number;
  audience?: string;
  brandKit?: BrandKit;
  keyPoints?: string[];
}
