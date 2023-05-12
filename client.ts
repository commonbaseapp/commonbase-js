import { rootApiUrl } from "./constants";
import {
  APIErrorResponse,
  APIResponse,
  ClientOptions,
  CompletionConfig,
  CompletionResult,
} from "./types";

class StreamConsumer {
  private stream: ReadableStreamDefaultReader;
  private streamDrained = false;
  private decoder = new TextDecoder();
  private buffer: Uint8Array = new Uint8Array();

  constructor(stream: ReadableStream<Uint8Array>) {
    this.stream = stream.getReader();
  }

  private async read(): Promise<void> {
    const { done, value } = await this.stream.read();
    if (done) {
      this.streamDrained = true;
      return;
    }
    this.buffer = new Uint8Array([...this.buffer, ...value]);
  }

  async next(): Promise<IteratorResult<CompletionResult>> {
    const newlineIndex = this.buffer.indexOf(10);
    if (newlineIndex === -1 && !this.streamDrained) {
      await this.read();
      return this.next();
    }
    if (newlineIndex === -1 && this.streamDrained) {
      // stream is done and there is no newline
      return { done: true, value: undefined };
    }
    const line = this.decoder.decode(this.buffer.slice(0, newlineIndex));
    this.buffer = this.buffer.slice(newlineIndex + 1);
    if (!line.startsWith("data: ")) {
      return this.next();
    }
    let data: APIResponse;
    try {
      data = JSON.parse(line.slice(6));
    } catch (e) {
      throw new Error(`invalid stream data: ${line.slice(6)}`);
    }
    return { done: false, value: new CompletionResult(data) };
  }
  [Symbol.asyncIterator]() {
    return this;
  }
}

export class APIError extends Error {
  public readonly errorResponse: APIErrorResponse;
  constructor(status: number, errorResponse: APIErrorResponse) {
    super(
      `api error (status=${status}): ${
        errorResponse.providerError || errorResponse.error
      }`,
    );
    this.errorResponse = errorResponse;
  }
}

export class Client {
  private options: ClientOptions;
  private readonly apiUrl: string;
  constructor(options?: ClientOptions) {
    this.options = options || {};
    this.apiUrl = this.options._apiUrl || rootApiUrl;
  }

  private getBody(config: CompletionConfig) {
    return {
      ...this.options._extraParams,
      projectId: config.projectId || this.options.projectId,
      apiKey: this.options.apiKey,
      variables: config.variables
        ? {
            ...this.options.defaultVariables,
            ...config.variables,
          }
        : undefined,
      context: config.chatContext,
      userId: config.userId,
      truncateVariable:
        config.truncateVariable || this.options.defaultTruncateVariableConfig,
      prompt: config.prompt,
      providerConfig: config.providerConfig,
    };
  }
  private async fetchAPI(
    path: string,
    config: CompletionConfig,
    stream = false,
  ): Promise<APIResponse | StreamConsumer> {
    const res = await fetch(`${this.apiUrl}/${path}`, {
      method: "POST",
      body: JSON.stringify({
        ...this.getBody(config),
        stream,
      }),
      headers: {
        ...this.options._extraHeaders,
        "Content-Type": "application/json; charset=utf-8",
      },
    });

    if (!res.ok) {
      const resBody = await res.json();
      throw new APIError(res.status, resBody);
    }

    if (!stream) {
      return await res.json();
    }
    if (!res.body) {
      throw new Error("no stream body");
    }
    return new StreamConsumer(res.body);
  }

  async createCompletion(config: CompletionConfig): Promise<CompletionResult> {
    const completionsRes = (await this.fetchAPI(
      "completions",
      config,
    )) as APIResponse;

    return new CompletionResult(completionsRes);
  }

  async createStreamingCompletion(
    config: CompletionConfig,
  ): Promise<StreamConsumer> {
    return (await this.fetchAPI("completions", config, true)) as StreamConsumer;
  }
}
