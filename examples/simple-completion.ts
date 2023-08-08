import * as process from "process";

// import { Client } from "@commonbase/sdk";
import { Client } from "../index";

async function main() {
  const client = new Client({
    apiKey: process.env.CB_API_KEY!,
    projectId: process.env.CB_PROJECT_ID,
  });
  const completionStream = await client.streamCompletion({
    prompt: "Greet our new customer with the name {{user}} who just signed up.",
    variables: {
      user: "Alice",
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
