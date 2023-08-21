import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import * as originalOpenAI from "openai";

import { Client } from "../client";

// export all types from the openai package
export * from "openai";

interface CreateCompletionRequest
  extends originalOpenAI.CreateCompletionRequest {
  variables?: Record<string, string>;
  projectId: string;
  prompt: string;
}

interface CreatChatCompletionRequest
  extends originalOpenAI.CreateChatCompletionRequest {
  projectId: string;
}

// override the OpenAIApi class to use the commonbase client
export class OpenAIApi extends originalOpenAI.OpenAIApi {
  private cbClient: Client;
  private cbApiKey: string;
  private openaiApiKey: string;
  constructor(
    configuration: originalOpenAI.Configuration,
    basePath?: string,
    axios?: AxiosInstance,
  ) {
    super(configuration, basePath, axios);
    if (typeof configuration.apiKey !== "function") {
      throw Error(
        "OpenAI configuration must contain an apiKey parameter that is a function.",
      );
    }
    this.cbApiKey = configuration.apiKey("commonbase") as string;
    this.openaiApiKey = configuration.apiKey("openai") as string;
    this.cbClient = new Client({
      apiKey: this.cbApiKey,
    });
  }

  public async createChatCompletion(
    createChatCompletionRequest: CreatChatCompletionRequest,
    options?: AxiosRequestConfig,
  ) {
    // return super.createChatCompletion(createChatCompletionRequest, options);
    const res = await this.cbClient.createChatCompletion({
      userId: createChatCompletionRequest.user,
      // The OpenAI chat messages can contain a role of "function",
      // which we don't support yet.
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      messages: createChatCompletionRequest.messages,
      projectId: createChatCompletionRequest.projectId,
      provider: "openai",
      providerApiKey: this.openaiApiKey,
      providerModel: createChatCompletionRequest.model,
      providerParams: {
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
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const transformedChoices = res.json.choices.map((choice: any) => {
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
      data: { ...(res.json as any), choices: transformedChoices },
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
      provider: "openai",
      providerModel: createCompletionRequest.model,
      providerApiKey: this.openaiApiKey,
      providerParams: {
        max_tokens: createCompletionRequest.max_tokens || undefined,
        temperature: createCompletionRequest.temperature || undefined,
        top_p: createCompletionRequest.top_p || undefined,
        n: createCompletionRequest.n || undefined,
        frequency_penalty:
          createCompletionRequest.frequency_penalty || undefined,
        presence_penalty: createCompletionRequest.presence_penalty || undefined,
        stop: createCompletionRequest.stop || undefined,
        best_of: createCompletionRequest.best_of || undefined,
        suffix: createCompletionRequest.suffix || undefined,
        logprobs: createCompletionRequest.logprobs || undefined,
      },
    });

    return {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: res.json as any,
      status: 200,
      headers: {},
      config: options,
    } as AxiosResponse<originalOpenAI.CreateCompletionResponse>;
  }
}
