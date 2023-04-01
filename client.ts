import { rootApiUrl } from "./constants";
import {
  APIResponse,
  ChatContext,
  ClientOptions,
  CompletionResults,
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

  async next(): Promise<IteratorResult<APIResponse>> {
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
    return { done: false, value: data };
  }
  [Symbol.asyncIterator]() {
    return this;
  }
}

export class Client {
  private options: ClientOptions;
  constructor(options?: ClientOptions) {
    this.options = options || {};
  }
  private async fetchAPI(
    path: string,
    body: object,
    projectId?: string,
    stream = false,
  ): Promise<APIResponse | StreamConsumer> {
    const res = await fetch(`${rootApiUrl}/${path}`, {
      method: "POST",
      body: JSON.stringify({
        projectId: projectId || this.options.projectId,
        apiKey: this.options.apiKey,
        ...body,
        stream,
      }),
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
    });

    if (!res.ok) {
      const resBody = await res.json();
      throw new Error(`api error (status=${res.status}): ${resBody.error}`);
    }

    if (!stream) {
      return await res.json();
    }
    if (!res.body) {
      throw new Error("no stream body");
    }
    return new StreamConsumer(res.body);
  }
  async createCompletion(
    variables: Record<string, string>,
    userId?: string,
    chatContext?: ChatContext,
    projectId?: string,
  ): Promise<CompletionResults> {
    const completionsRes = (await this.fetchAPI(
      "completions",
      {
        variables: {
          ...this.options.defaultVariables,
          ...variables,
        },
        context: chatContext,
        userId,
      },
      projectId,
    )) as APIResponse;

    if (completionsRes.error) {
      throw new Error(`api error: ${completionsRes.error}`);
    }

    if (!completionsRes.choices || completionsRes.choices.length === 0) {
      throw new Error("no completions found");
    }
    return {
      bestResult: completionsRes.choices[0].text,
      choices: completionsRes.choices.map((c) => c.text),
      _raw: completionsRes,
    };
  }

  async createStreamingCompletion(
    variables: Record<string, string>,
    userId?: string,
    chatContext?: ChatContext,
    projectId?: string,
  ): Promise<StreamConsumer> {
    return (await this.fetchAPI(
      "completions",
      {
        variables: {
          ...this.options.defaultVariables,
          ...variables,
        },
        context: chatContext,
        userId,
      },
      projectId,
      true,
    )) as StreamConsumer;
  }
}
