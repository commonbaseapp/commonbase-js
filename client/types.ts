export type ClientOptions = {
  apiKey: string;
  projectId?: string;
};

export type Role = "system" | "user" | "assistant";

export type ChatMessage = {
  role: Role;
  content: string;
};

export type ChatContext = {
  messages: ChatMessage[];
};

type CompletionResponseChoice = {
  index: number;
  finish_reason: string | null;
  text: string;
  role?: Role;
  logprobs?: number;
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

type OpenAIProviderConfig = {
  provider: "openai" | "cb-openai-eu";
  params: {
    type: "chat" | "text" | "embeddings";
    model?: string;
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

type AnthropicProviderConfig = {
  provider: "anthropic";
  params: {
    type: "chat" | undefined;
    model?: string;
    max_tokens_to_sample?: number;
    temperature?: number;
    stop_sequences?: string[];
    top_k?: number;
    top_p?: number;
  };
};

export type ProviderConfig = OpenAIProviderConfig | AnthropicProviderConfig;

export interface RequestConfig {
  projectId?: string;
  userId?: string;
  providerApiKey?: string;
  providerConfig?: ProviderConfig;
}

export interface CompletionConfig extends RequestConfig {
  prompt: string;
  chatContext?: ChatContext;
  variables?: Record<string, string>;
}

export interface EmbeddingsConfig extends RequestConfig {
  input: string;
}
