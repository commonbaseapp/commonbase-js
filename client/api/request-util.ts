import { ClientOptions, CompletionConfig, EmbeddingsConfig } from "../types";

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
