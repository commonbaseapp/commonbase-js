export type CompletionResults = {
  bestResult: string;
  choices: string[];
  _raw: APIResponse;
};

export type ClientOptions = {
  projectId?: string;
  apiKey?: string;
  defaultVariables?: Record<string, string>;
};

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
