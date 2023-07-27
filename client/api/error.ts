import { APIErrorResponse } from "../types";

export class APIError extends Error {
  public readonly errorResponse: APIErrorResponse;
  constructor(status: number, errorResponse: APIErrorResponse) {
    super(
      `api error (status=${status}): ${
        errorResponse.providerError || errorResponse.error
      }`,
    );
    this.errorResponse = errorResponse;
  }
}
