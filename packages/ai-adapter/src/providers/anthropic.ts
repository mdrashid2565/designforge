import { AICompletionOptions, AICompletionResult, ProviderConfig } from '../types.js';
import { IAIProvider } from './base.js';

export class AnthropicProvider implements IAIProvider {
  name = 'anthropic' as const;

  async generateCompletion(options: AICompletionOptions, config: ProviderConfig): Promise<AICompletionResult> {
    const apiKey = config.apiKey || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('Anthropic API key missing.');
    }

    const url = 'https://api.anthropic.com/v1/messages';
    const systemMsg = options.messages.find((m) => m.role === 'system')?.content || '';
    const nonSystemMsgs = options.messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      }));

    const body: any = {
      model: config.model || 'claude-3-5-sonnet-20241022',
      max_tokens: config.maxTokens ?? 2048,
      temperature: config.temperature ?? 0.7,
      system: systemMsg,
      messages: nonSystemMsgs,
    };

    if (options.tools && options.tools.length > 0) {
      body.tools = options.tools.map((t) => ({
        name: t.name,
        description: t.description,
        input_schema: t.parameters,
      }));
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Anthropic API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    let textContent = '';
    const toolCalls: any[] = [];

    for (const block of data.content || []) {
      if (block.type === 'text') {
        textContent += block.text;
      } else if (block.type === 'tool_use') {
        toolCalls.push({
          id: block.id,
          name: block.name,
          arguments: block.input || {},
        });
      }
    }

    return {
      content: textContent,
      toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
      provider: 'anthropic',
      model: data.model || config.model,
      usage: data.usage ? {
        promptTokens: data.usage.input_tokens,
        completionTokens: data.usage.output_tokens,
        totalTokens: data.usage.input_tokens + data.usage.output_tokens,
      } : undefined,
    };
  }
}

export class GeminiProvider implements IAIProvider {
  name = 'gemini' as const;

  async generateCompletion(options: AICompletionOptions, config: ProviderConfig): Promise<AICompletionResult> {
    const apiKey = config.apiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Google Gemini API key missing.');
    }

    const model = config.model || 'gemini-1.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const contents = options.messages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const body: any = { contents };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const candidate = data.candidates?.[0];
    const text = candidate?.content?.parts?.map((p: any) => p.text).join('') || '';

    return {
      content: text,
      provider: 'gemini',
      model: model,
    };
  }
}

export class OllamaProvider implements IAIProvider {
  name = 'ollama' as const;

  async generateCompletion(options: AICompletionOptions, config: ProviderConfig): Promise<AICompletionResult> {
    const baseUrl = (config.baseUrl || process.env.OLLAMA_BASE_URL || 'http://localhost:11434').replace(/\/+$/, '');
    const url = `${baseUrl}/api/chat`;

    const body = {
      model: config.model || 'llama3',
      messages: options.messages.map((m) => ({ role: m.role, content: m.content })),
      stream: false,
      options: {
        temperature: config.temperature ?? 0.7,
      },
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ollama API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    return {
      content: data.message?.content || '',
      provider: 'ollama',
      model: config.model,
    };
  }
}
