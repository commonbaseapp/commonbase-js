import type { CompletionResponse } from "./types";

export class CompletionResult {
  private readonly _rawResponse: CompletionResponse;
  constructor(response: CompletionResponse) {
    this._rawResponse = response;
  }

  get bestResult(): string {
    return this.choices[0] ?? "";
  }

  get choices(): string[] {
    if (!this._rawResponse.choices || this._rawResponse.choices.length === 0) {
      // TODO: Check API to see why this occasionally happens.
      console.warn("CompletionResponse contains no choices.");
      return [];
    }
    return this._rawResponse.choices.map((c) => c.text) ?? [];
  }

  get completed(): boolean {
    return this._rawResponse.completed;
  }

  get _raw(): CompletionResponse {
    return this._rawResponse;
  }
}
