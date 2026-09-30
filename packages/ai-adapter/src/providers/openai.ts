import { AICompletionOptions, AICompletionResult, ProviderConfig } from '../types.js';
import { IAIProvider } from './base.js';

export class OpenAIProvider implements IAIProvider {
  name = 'openai' as const;

  async generateCompletion(options: AICompletionOptions, config: ProviderConfig): Promise<AICompletionResult> {
    const apiKey = config.apiKey || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key missing. Please provide it in configuration or environment variable OPENAI_API_KEY.');
    }

    const baseUrl = (config.baseUrl || 'https://api.openai.com/v1').replace(/\/+$/, '');
    const url = `${baseUrl}/chat/completions`;

    const formattedMessages = options.messages.map((m) => {
      const msg: any = { role: m.role, content: m.content };
      if (m.toolCalls) {
        msg.tool_calls = m.toolCalls.map((tc) => ({
          id: tc.id,
          type: 'function',
          function: { name: tc.name, arguments: JSON.stringify(tc.arguments) },
        }));
      }
      if (m.toolCallId) {
        msg.tool_call_id = m.toolCallId;
      }
      return msg;
    });

    const body: any = {
      model: config.model || 'gpt-4o',
      messages: formattedMessages,
      temperature: config.temperature ?? 0.7,
      max_tokens: config.maxTokens ?? 2048,
    };

    if (options.tools && options.tools.length > 0) {
      body.tools = options.tools.map((t) => ({
        type: 'function',
        function: {
          name: t.name,
          description: t.description,
          parameters: t.parameters,
        },
      }));
    }

    if (options.responseFormat === 'json') {
      body.response_format = { type: 'json_object' };
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const choice = data.choices?.[0];
    const message = choice?.message;

    let toolCalls;
    if (message?.tool_calls) {
      toolCalls = message.tool_calls.map((tc: any) => ({
        id: tc.id,
        name: tc.function.name,
        arguments: JSON.parse(tc.function.arguments || '{}'),
      }));
    }

    return {
      content: message?.content || '',
      toolCalls,
      provider: 'openai',
      model: data.model || config.model,
      usage: data.usage ? {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens,
      } : undefined,
    };
  }
}
