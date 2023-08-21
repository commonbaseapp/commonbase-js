import { CompletionResult } from "./completion-result";
import type { CompletionResponse } from "./types";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class StreamConsumer {
  private stream: ReadableStreamDefaultReader;
  private streamDrained = false;
  private decoder = new TextDecoder();
  private buffer: Uint8Array = new Uint8Array();

  private minDelay = 0;
  private lastResponseTs = 0;

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

  setMinimumDelay(ms: number) {
    this.minDelay = ms;
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
    let data: CompletionResponse;
    try {
      data = JSON.parse(line.slice(6));
    } catch (e) {
      throw new Error(`invalid stream data: ${line.slice(6)}`);
    }
    const timeSinceLastResponse = Date.now() - this.lastResponseTs;
    if (timeSinceLastResponse < this.minDelay) {
      await sleep(this.minDelay - timeSinceLastResponse);
    }
    this.lastResponseTs = Date.now();
    return { done: false, value: new CompletionResult(data) };
  }
  [Symbol.asyncIterator]() {
    return this;
  }
}
