import type { CompletionResponse } from "./types";

export class CompletionResult {
  private readonly _rawResponse: CompletionResponse;
  constructor(response: CompletionResponse) {
    this._rawResponse = response;
  }

  private assertChoices() {
    if (!this._rawResponse.choices?.length) {
      throw new Error("no completions found");
    }
  }
  get bestResult(): string {
    this.assertChoices();
    return this._rawResponse.choices[0].text;
  }

  get choices(): string[] {
    this.assertChoices();
    return this._rawResponse.choices.map((c) => c.text);
  }

  get completed(): boolean {
    return this._rawResponse.completed;
  }

  get _raw(): CompletionResponse {
    return this._rawResponse;
  }
}
