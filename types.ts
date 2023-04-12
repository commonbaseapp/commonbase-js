export type CompletionResults = {
  bestResult: string;
  choices: string[];
  _raw: APIResponse;
};

export type ClientOptions = {
  projectId?: string;
  apiKey?: string;
  defaultVariables?: Record<string, string>;
  _apiUrl?: string;
  _extraHeaders?: Record<string, string>;
  _extraParams?: Record<string, string | number | boolean>;
};

type IsNode = typeof globalThis extends { process: unknown } ? true : false;

export type ChatClientOptions = {
  projectId: string;
} & (
  | { sessionId?: string }
  | ({
      variables?: Record<string, string>;
    } & (IsNode extends true
      ? { sessionData?: Record<string, string> }
      : { INSECURE_sessionData?: Record<string, string> }))
);

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type ChatContext = {
  messages: ChatMessage[];
};

type APIResponseChoice = {
  index: number;
  finish_reason: string;
  text: string;
  role?: "system" | "user" | "assistant";
  logprobs?: number;
};

export type APIResponse = {
  completed: boolean;
  invocationId: string;
  projectId: string;
  type: string;
  model: string;
  choices: APIResponseChoice[];
};

export type APIErrorResponse = {
  error: string;
  invocationId?: string;
  providerError?: string;
  sentryId?: string;
};
