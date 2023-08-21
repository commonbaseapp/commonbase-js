import type {
  ChatMessage,
  CompletionResponse,
  CompletionResponseChoice,
} from "./types";

export class CompletionChoice {
  private readonly _rawChoice: CompletionResponseChoice;
  constructor(choice: CompletionResponseChoice) {
    this._rawChoice = choice;
  }

  get index(): number {
    return this._rawChoice.index;
  }

  get finishReason(): string | null {
    return this._rawChoice.finish_reason;
  }

  get text(): string {
    return this._rawChoice.text;
  }

  get role() {
    return this._rawChoice.role;
  }

  get functionCall() {
    return this._rawChoice.function_call;
  }

  toAssistantChatMessage(): ChatMessage {
    return this._rawChoice.function_call
      ? {
          role: "assistant",
          content: this._rawChoice.text,
          function_call: this._rawChoice.function_call,
        }
      : {
          role: "assistant",
          content: this._rawChoice.text,
        };
  }
}

export class CompletionResult {
  private readonly _rawResponse: CompletionResponse;
  private readonly _choices: CompletionChoice[];
  constructor(response: CompletionResponse) {
    this._rawResponse = response;
    this._choices = response.choices?.map((c) => new CompletionChoice(c)) ?? [];
    if (this._choices.length === 0) {
      // TODO: Check API to see why this occasionally happens.
      console.warn("CompletionResponse contains no choices.");
    }
  }

  get bestChoice(): CompletionChoice {
    return (
      this._choices[0] ??
      new CompletionChoice({
        index: 0,
        text: "",
        finish_reason: null,
      })
    );
  }

  get choices(): CompletionChoice[] {
    return this._choices;
  }

  get completed(): boolean {
    return this._rawResponse.completed;
  }

  get asJson(): CompletionResponse {
    return this._rawResponse;
  }
}
