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
  });

  console.log(embeddingsResponse.data);
}

main().catch(console.error);
