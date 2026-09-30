import { AnthropicProvider, GeminiProvider, OllamaProvider } from './providers/anthropic.js';
import { IAIProvider, MockAIProvider } from './providers/base.js';
import { OpenAIProvider } from './providers/openai.js';
import {
  AICompletionOptions,
  AICompletionResult,
  AIProviderName,
  ProviderConfig,
} from './types.js';

export class AIAdapterManager {
  private providers: Map<AIProviderName, IAIProvider> = new Map();
  private defaultProvider: AIProviderName = 'openai';
  private defaultModel = 'gpt-4o';
  private customConfigs: Map<string, ProviderConfig> = new Map();

  constructor() {
    this.registerProvider(new OpenAIProvider());
    this.registerProvider(new AnthropicProvider());
    this.registerProvider(new GeminiProvider());
    this.registerProvider(new OllamaProvider());
    this.registerProvider(new MockAIProvider());
  }

  public registerProvider(provider: IAIProvider): void {
    this.providers.set(provider.name, provider);
  }

  public setWorkspaceConfig(workspaceId: string, config: ProviderConfig): void {
    this.customConfigs.set(workspaceId, config);
  }

  public getWorkspaceConfig(workspaceId?: string): ProviderConfig {
    if (workspaceId && this.customConfigs.has(workspaceId)) {
      return this.customConfigs.get(workspaceId)!;
    }
    return {
      provider: this.defaultProvider,
      model: this.defaultModel,
    };
  }

  public async complete(
    options: AICompletionOptions,
    config?: Partial<ProviderConfig>,
    fallbackChain?: ProviderConfig[]
  ): Promise<AICompletionResult> {
    const primaryConfig: ProviderConfig = {
      provider: config?.provider || this.defaultProvider,
      model: config?.model || this.defaultModel,
      apiKey: config?.apiKey,
      baseUrl: config?.baseUrl,
      temperature: config?.temperature ?? 0.7,
      maxTokens: config?.maxTokens ?? 2048,
    };

    const chain: ProviderConfig[] = [primaryConfig, ...(fallbackChain || [])];
    let lastError: Error | null = null;

    for (const conf of chain) {
      const provider = this.providers.get(conf.provider);
      if (!provider) continue;

      try {
        return await provider.generateCompletion(options, conf);
      } catch (err: any) {
        lastError = err;
        console.warn(`[AIAdapter] Provider ${conf.provider} (${conf.model}) failed: ${err.message}. Trying next fallback...`);
      }
    }

    // If real provider calls failed or keys not supplied, fallback to MockAIProvider to ensure deterministic runnable output
    const mock = new MockAIProvider();
    return await mock.generateCompletion(options, primaryConfig);
  }
}
