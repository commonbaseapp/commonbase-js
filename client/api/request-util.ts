import type {
  ClientOptions,
  CompletionConfig,
  EmbeddingsConfig,
} from "../types";

const ROOT_API_URL = "https://api.commonbase.com";

export function getUrl(path: string, options?: ClientOptions) {
  return `${options?._apiUrl || ROOT_API_URL}/${path}`;
}

export function getHeaders(options: ClientOptions) {
  return {
    ...options._extraHeaders,
    "Content-Type": "application/json; charset=utf-8",
  };
}

export function getCompletionBody(
  config: CompletionConfig,
  options: ClientOptions,
) {
  return {
    ...options._extraParams,
    projectId: config.projectId ?? options.projectId,
    apiKey: options.apiKey,
    variables: config.variables
      ? {
          ...options.defaultVariables,
          ...config.variables,
        }
      : undefined,
    context: config.chatContext,
    userId: config.userId,
    truncateVariable:
      config.truncateVariable ?? options.defaultTruncateVariableConfig,
    prompt: config.prompt,
    providerConfig: config.providerConfig,
  };
}

export function getEmbeddingsBody(
  config: EmbeddingsConfig,
  options: ClientOptions,
) {
  return {
    ...options._extraParams,
    projectId: config.projectId ?? options.projectId,
    apiKey: options.apiKey,
    userId: config.userId,
    input: config.input,
    providerConfig: config.providerConfig,
  };
}
