import * as assert from "assert";
import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import * as originalOpenAI from "openai";

import { Client } from "../client";

// export all types from the openai package
export * from "openai";

interface CreateCompletionRequest
  extends originalOpenAI.CreateCompletionRequest {
  variables?: Record<string, string>;
  projectId?: string;
}

interface CreatChatCompletionRequest
  extends originalOpenAI.CreateChatCompletionRequest {
  variables?: Record<string, string>;
  projectId?: string;
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
    const res = await this.cbClient.createCompletion(
      createChatCompletionRequest.variables || {},
      createChatCompletionRequest.user,
      {
        messages: createChatCompletionRequest.messages,
      },
      createChatCompletionRequest.projectId,
    );
    assert.ok(res._raw.completed);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    res._raw.choices = res._raw.choices.map((choice: any) => {
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
      data: res._raw as any,
      status: 200,
      headers: {},
      config: options,
    } as AxiosResponse<originalOpenAI.CreateChatCompletionResponse>;
  }

  public async createCompletion(
    createCompletionRequest: CreateCompletionRequest,
    options?: AxiosRequestConfig,
  ) {
    const projectId =
      createCompletionRequest.projectId ||
      (typeof createCompletionRequest.prompt === "string"
        ? createCompletionRequest.prompt
        : undefined);

    const res = await this.cbClient.createCompletion(
      createCompletionRequest.variables || {},
      createCompletionRequest.user,
      undefined,
      projectId,
    );
    return {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: res._raw as any,
      status: 200,
      headers: {},
      config: options,
    } as AxiosResponse<originalOpenAI.CreateCompletionResponse>;
  }
}
