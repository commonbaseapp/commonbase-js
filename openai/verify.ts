import * as openAI from "openai";

import * as commonBaseShim from ".";

commonBaseShim satisfies typeof openAI;
commonBaseShim.OpenAIApi;
