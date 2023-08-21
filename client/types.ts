export type ClientOptions = {
  apiKey: string;
  projectId?: string;
};

type Role = "system" | "user" | "assistant" | "function";

type FunctionCall = {
  name: string;
  arguments?: string;
};

export type TextChatMessage = {
  role: Extract<Role, "system" | "user" | "assistant">;
  content: string;
};

export type FunctionCallChatMessage = {
  role: Extract<Role, "assistant">;
  function_call: FunctionCall;
};

export type FunctionChatMessage = {
  role: Extract<Role, "function">;
  name: string;
  content: string;
};

export type ChatMessage =
  | TextChatMessage
  | FunctionCallChatMessage
  | FunctionChatMessage;

type FunctionCallResponse = {
  name: string;
  arguments?: string;
};

export type CompletionResponseChoice = {
  index: number;
  finish_reason: string | null;
  text: string;
  role?: Role;
  logprobs?: number;
  function_call?: FunctionCallResponse;
};

export type CompletionResponse = {
  completed: boolean;
  invocationId: string;
  projectId: string;
  type: string;
  model: string;
  choices: CompletionResponseChoice[];
};

export type EmbeddingsResponse = {
  completed: boolean;
  invocationId: string;
  projectId: string;
  type: string;
  model: string;
  data: {
    object: "embedding";
    index: number;
    embedding: number[];
  }[];
};

export type APIErrorResponse = {
  error: string;
  invocationId?: string;
  providerError?: string;
  sentryId?: string;
};

type ChatFunction = {
  name: string;
  description: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parameters: Record<string, any>;
};

type FunctionCallConfig = "none" | "auto" | { name: string };

type OpenAIProviderConfig = {
  provider?: "openai";
  providerApiKey?: string;
  providerModel?: string;
  providerParams?: {
    temperature?: number;
    top_p?: number;
    max_tokens?: number;
    n?: number;
    frequency_penalty?: number;
    presence_penalty?: number;
    stop?: string[] | string;
    best_of?: number;
    suffix?: string;
    logprobs?: number;
  };
};

type CbOpenAIProviderConfig = Omit<
  OpenAIProviderConfig,
  "provider" | "providerApiKey"
> & {
  provider: "cb-openai-eu" | "cb-openai-us";
};

type AnthropicProviderConfig = {
  provider?: "anthropic";
  providerApiKey?: string;
  providerModel?: string;
  providerParams?: {
    max_tokens_to_sample?: number;
    temperature?: number;
    stop_sequences?: string[];
    top_k?: number;
    top_p?: number;
  };
};

export type RequestConfig = {
  projectId?: string;
  userId?: string;
};

export type TextCompletionConfig = RequestConfig & {
  prompt: string;
  variables?: Record<string, string>;
} & (OpenAIProviderConfig | CbOpenAIProviderConfig);

export type ChatCompletionConfig = RequestConfig & {
  messages: ChatMessage[];
  functions?: ChatFunction[];
  functionCall?: FunctionCallConfig;
} & (OpenAIProviderConfig | CbOpenAIProviderConfig | AnthropicProviderConfig);

export type Provider = Required<
  TextCompletionConfig | ChatCompletionConfig
>["provider"];

export type RequestType = "text" | "chat" | "embeddings";

export type EmbeddingsConfig = RequestConfig & {
  input: string;
} & (OpenAIProviderConfig | CbOpenAIProviderConfig);
