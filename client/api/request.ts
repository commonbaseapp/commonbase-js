import type {
  ClientOptions,
  CompletionConfig,
  EmbeddingsConfig,
} from "../types";
import { APIError } from "./error";
import {
  getCompletionBody,
  getEmbeddingsBody,
  getHeaders,
  getUrl,
} from "./request-util";

export async function fetchCompletionsAPI(
  config: CompletionConfig,
  options: ClientOptions,
  stream = false,
): Promise<Response> {
  const res = await fetch(getUrl("completions"), {
    method: "POST",
    body: JSON.stringify({
      ...getCompletionBody(config, options),
      stream,
    }),
    headers: getHeaders(options),
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
    headers: getHeaders(options),
  });

  if (!res.ok) {
    const resBody = await res.json();
    throw new APIError(res.status, resBody);
  }

  return res;
}
