import { readFile } from "fs/promises";
import * as process from "process";

// import { Client } from "@commonbase/sdk";
import { Client } from "../index";

async function main() {
  const client = new Client({
    apiKey: process.env.CB_API_KEY!,
    projectId: process.env.CB_PROJECT_ID,
  });

  const buildLogs = await readFile("./build.log", "utf8");
  const completionStream = await client.createStreamingCompletion({
    variables: {
      build_logs: buildLogs,
    },
    truncateVariable: {
      strategy: "truncate_head",
      maxPromptTokens: 3000,
    },
  });
  for await (const completionResult of completionStream) {
    if (completionResult.completed) {
      process.stdout.write("\n\n");
      console.log("streamCompleted", completionResult);
      continue;
    }
    process.stdout.write(completionResult.bestResult);
  }

  console.log("done");
}

main().catch(console.error);
