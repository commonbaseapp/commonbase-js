import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import * as originalOpenAI from "openai";

import { Client } from "../client";

// export all types from the openai package
export * from "openai";

interface CreateCompletionRequest
  extends originalOpenAI.CreateCompletionRequest {
  variables?: Record<string, string>;
  projectId: string;
}

interface CreatChatCompletionRequest
  extends originalOpenAI.CreateChatCompletionRequest {
  projectId: string;
}

// override the OpenAIApi class to use the commonbase client
export class OpenAIApi extends originalOpenAI.OpenAIApi {
  private cbClient: Client;
  constructor(
    configuration: originalOpenAI.Configuration,
    basePath?: string,
    axios?: AxiosInstance,
  ) {
    super(configuration, basePath, axios);
    this.cbClient = new Client({
      apiKey: configuration.apiKey as string,
    });
  }

  public async createChatCompletion(
    createChatCompletionRequest: CreatChatCompletionRequest,
    options?: AxiosRequestConfig,
  ) {
    // return super.createChatCompletion(createChatCompletionRequest, options);
    const res = await this.cbClient.createCompletion({
      userId: createChatCompletionRequest.user,
      chatContext: {
        messages: createChatCompletionRequest.messages,
      },
      projectId: createChatCompletionRequest.projectId,
      prompt: "\n", // we need to set prompt to avoid the default prompt
      providerConfig: {
        provider: "openai",
        params: {
          type: "chat",
          model: createChatCompletionRequest.model,
          max_tokens: createChatCompletionRequest.max_tokens || undefined,
          temperature: createChatCompletionRequest.temperature || undefined,
          top_p: createChatCompletionRequest.top_p || undefined,
          n: createChatCompletionRequest.n || undefined,
          frequency_penalty:
            createChatCompletionRequest.frequency_penalty || undefined,
          presence_penalty:
            createChatCompletionRequest.presence_penalty || undefined,
          stop: createChatCompletionRequest.stop || undefined,
        },
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const transformedChoices = res._raw.choices.map((choice: any) => {
      // transform text response to messages response
      choice.message = {
        content: choice.text,
        role: choice.role || "assistant",
      };
      delete choice.text;
      delete choice.role;
      return choice;
    });

    return {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: { ...(res._raw as any), choices: transformedChoices },
      status: 200,
      headers: {},
      config: options,
    } as AxiosResponse<originalOpenAI.CreateChatCompletionResponse>;
  }

  public async createCompletion(
    createCompletionRequest: CreateCompletionRequest,
    options?: AxiosRequestConfig,
  ) {
    const res = await this.cbClient.createCompletion({
      userId: createCompletionRequest.user,
      projectId: createCompletionRequest.projectId,
      prompt: createCompletionRequest.prompt?.toString(),
      providerConfig: {
        provider: "openai",
        params: {
          type: "text",
          model: createCompletionRequest.model,
          max_tokens: createCompletionRequest.max_tokens || undefined,
          temperature: createCompletionRequest.temperature || undefined,
          top_p: createCompletionRequest.top_p || undefined,
          n: createCompletionRequest.n || undefined,
          frequency_penalty:
            createCompletionRequest.frequency_penalty || undefined,
          presence_penalty:
            createCompletionRequest.presence_penalty || undefined,
          stop: createCompletionRequest.stop || undefined,
          best_of: createCompletionRequest.best_of || undefined,
          suffix: createCompletionRequest.suffix || undefined,
          logprobs: createCompletionRequest.logprobs || undefined,
        },
      },
    });

    return {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: res._raw as any,
      status: 200,
      headers: {},
      config: options,
    } as AxiosResponse<originalOpenAI.CreateCompletionResponse>;
  }
}
