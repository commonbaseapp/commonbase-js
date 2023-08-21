import { fetchCompletionsAPI, fetchEmbeddingsAPI } from "./api/request";
import { CompletionResult } from "./completion-result";
import { StreamConsumer } from "./stream-consumer";
import type {
  ChatCompletionConfig,
  ClientOptions,
  CompletionResponse,
  EmbeddingsConfig,
  EmbeddingsResponse,
  TextCompletionConfig,
} from "./types";

export class Client {
  private options: ClientOptions;
  constructor(options: ClientOptions) {
    if (!options?.apiKey || options.apiKey.trim().length === 0) {
      throw Error("A Commonbase API Key is required for all requests.");
    }

    this.options = options;
  }

  async createCompletion(
    config: TextCompletionConfig,
  ): Promise<CompletionResult> {
    const completionsRes = await fetchCompletionsAPI(
      config,
      this.options,
      "text",
    );

    return new CompletionResult(
      (await completionsRes.json()) as CompletionResponse,
    );
  }

  async createChatCompletion(
    config: ChatCompletionConfig,
  ): Promise<CompletionResult> {
    const completionsRes = await fetchCompletionsAPI(
      config,
      this.options,
      "chat",
    );

    return new CompletionResult(
      (await completionsRes.json()) as CompletionResponse,
    );
  }

  async streamChatCompletion(
    config: ChatCompletionConfig,
  ): Promise<StreamConsumer> {
    const res = await fetchCompletionsAPI(config, this.options, "chat", true);
    if (!res.body) {
      throw new Error("no stream body");
    }
    return new StreamConsumer(res.body);
  }

  async createEmbedding(config: EmbeddingsConfig): Promise<EmbeddingsResponse> {
    const res = await fetchEmbeddingsAPI(config, this.options);
    return (await res.json()) as EmbeddingsResponse;
  }
}
