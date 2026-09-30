import { AICompletionOptions, AICompletionResult, AIProviderName, ProviderConfig } from '../types.js';

export interface IAIProvider {
  name: AIProviderName;
  generateCompletion(options: AICompletionOptions, config: ProviderConfig): Promise<AICompletionResult>;
}

export class MockAIProvider implements IAIProvider {
  name: AIProviderName = 'custom_openai';

  async generateCompletion(options: AICompletionOptions, config: ProviderConfig): Promise<AICompletionResult> {
    const lastMsg = options.messages[options.messages.length - 1]?.content || '';

    // If tools provided and prompt asks to create/modify something, simulate tool call
    if (options.tools && options.tools.length > 0 && lastMsg.toLowerCase().includes('add text')) {
      return {
        content: 'I will add the requested text element to your canvas.',
        toolCalls: [
          {
            id: `call_${Date.now()}`,
            name: 'add_text',
            arguments: {
              text: 'Autonomous AI Design',
              fontSize: 48,
              x: 100,
              y: 150,
            },
          },
        ],
        provider: this.name,
        model: config.model,
        usage: { promptTokens: 50, completionTokens: 25, totalTokens: 75 },
      };
    }

    return {
      content: `[AI Simulated Output using ${config.model}]: Creative response generated for "${lastMsg.slice(0, 50)}..."`,
      provider: this.name,
      model: config.model,
      usage: { promptTokens: 30, completionTokens: 40, totalTokens: 70 },
    };
  }
}
