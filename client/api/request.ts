import type {
  ChatCompletionConfig,
  ClientOptions,
  EmbeddingsConfig,
  RequestType,
  TextCompletionConfig,
} from "../types";
import { APIError } from "./error";
import {
  getCompletionBody,
  getEmbeddingsBody,
  getHeaders,
  getUrl,
} from "./request-util";

export async function fetchCompletionsAPI(
  config: TextCompletionConfig | ChatCompletionConfig,
  options: ClientOptions,
  type: Exclude<RequestType, "embeddings">,
  stream = false,
): Promise<Response> {
  const res = await fetch(getUrl("completions"), {
    method: "POST",
    body: JSON.stringify({
      ...getCompletionBody(config, options, type),
      stream,
    }),
    headers: getHeaders(options, config),
  });

  if (!res.ok) {
    const resBody = await res.json();
    throw new APIError(res.status, resBody);
  }

  return res;
}

export async function fetchEmbeddingsAPI(
  config: EmbeddingsConfig,
  options: ClientOptions,
): Promise<Response> {
  const res = await fetch(getUrl("embeddings"), {
    method: "POST",
    body: JSON.stringify(getEmbeddingsBody(config, options)),
    headers: getHeaders(options, config),
  });

  if (!res.ok) {
    const resBody = await res.json();
    throw new APIError(res.status, resBody);
  }

  return res;
}
