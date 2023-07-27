import { fetchCompletionsAPI, fetchEmbeddingsAPI } from "./api/request";
import { StreamConsumer } from "./stream-consumer";
import {
  ClientOptions,
  CompletionConfig,
  CompletionResponse,
  CompletionResult,
  EmbeddingsConfig,
  EmbeddingsResponse,
} from "./types";

export class Client {
  private options: ClientOptions;
  constructor(options?: ClientOptions) {
    this.options = options || {};
  }

  async createCompletion(config: CompletionConfig): Promise<CompletionResult> {
    const completionsRes = await fetchCompletionsAPI(this.options, config);

    return new CompletionResult(
      (await completionsRes.json()) as CompletionResponse,
    );
  }

  async createStreamingCompletion(
    config: CompletionConfig,
  ): Promise<StreamConsumer> {
    const res = await fetchCompletionsAPI(config, this.options, true);
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
