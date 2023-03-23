import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import * as originalOpenAI from "openai";

import { Client } from "../client";

export {
  ChatCompletionRequestMessage,
  ChatCompletionRequestMessageRoleEnum,
  ChatCompletionResponseMessage,
  ChatCompletionResponseMessageRoleEnum,
  Configuration,
  ConfigurationParameters,
  CreateAnswerRequest,
  CreateAnswerResponse,
  CreateAnswerResponseSelectedDocumentsInner,
  CreateChatCompletionRequest,
  CreateChatCompletionResponse,
  CreateChatCompletionResponseChoicesInner,
  CreateClassificationRequest,
  CreateClassificationResponse,
  CreateClassificationResponseSelectedExamplesInner,
  CreateCompletionRequest,
  CreateCompletionResponse,
  CreateCompletionResponseChoicesInner,
  CreateCompletionResponseChoicesInnerLogprobs,
  CreateCompletionResponseUsage,
  CreateEditRequest,
  CreateEditResponse,
  CreateEmbeddingRequest,
  CreateEmbeddingResponse,
  CreateEmbeddingResponseDataInner,
  CreateEmbeddingResponseUsage,
  CreateFineTuneRequest,
  CreateImageRequest,
  CreateImageRequestResponseFormatEnum,
  CreateImageRequestSizeEnum,
  CreateModerationRequest,
  CreateModerationResponse,
  CreateModerationResponseResultsInner,
  CreateModerationResponseResultsInnerCategories,
  CreateModerationResponseResultsInnerCategoryScores,
  CreateSearchRequest,
  CreateSearchResponse,
  CreateSearchResponseDataInner,
  CreateTranscriptionResponse,
  CreateTranslationResponse,
  DeleteFileResponse,
  DeleteModelResponse,
  Engine,
  FineTune,
  FineTuneEvent,
  ImagesResponse,
  ImagesResponseDataInner,
  ListEnginesResponse,
  ListFilesResponse,
  ListFineTuneEventsResponse,
  ListFineTunesResponse,
  ListModelsResponse,
  Model,
  OpenAIApiAxiosParamCreator,
  OpenAIApiFactory,
  OpenAIApiFp,
  OpenAIFile,
} from "openai";

interface CreateCompletionRequest
  extends originalOpenAI.CreateCompletionRequest {
  variables?: Record<string, string>;
  projectId?: string;
}

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
    createChatCompletionRequest: originalOpenAI.CreateChatCompletionRequest,
    options?: AxiosRequestConfig,
  ) {
    // TODO: implement
    return super.createChatCompletion(createChatCompletionRequest, options);
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
    // TODO: validate projectId, if not valid call the openai api directly

    const res = await this.cbClient.createCompletion(
      createCompletionRequest.variables || {},
      createCompletionRequest.user,
      projectId,
    );
    return {
      data: res._raw,
      status: 200,
      headers: {},
      config: options,
    } as AxiosResponse<originalOpenAI.CreateCompletionResponse>;
  }
}
