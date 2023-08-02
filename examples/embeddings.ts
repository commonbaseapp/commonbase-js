import * as process from "process";

// import { Client } from "@commonbase/sdk";
import { Client } from "../index";

async function main() {
  const client = new Client({
    apiKey: process.env.CB_API_KEY!,
    projectId: process.env.CB_PROJECT_ID,
  });
  const embeddingsResponse = await client.createEmbedding({
    input: "Your text string",
    providerConfig: {
      provider: "cb-openai-eu",
      params: {
        type: "embeddings",
        model: "text-embedding-ada-002",
      },
    },
  });

  console.log(embeddingsResponse.data);
}

main().catch(console.error);
