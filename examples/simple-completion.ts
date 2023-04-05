import process from "process";

// import { Client } from "@commonbase/sdk";
import { Client } from "../index";

async function main() {
  const client = new Client({
    projectId: process.env.CB_PROJECT_ID,
  });
  const completionStream = await client.createStreamingCompletion({
    user: "Alice",
  });
  for await (const completionResult of completionStream) {
    if (completionResult.completed) {
      process.stdout.write("\n\n");
      console.log("streamCompleted", completionResult);
      continue;
    }
    process.stdout.write(completionResult.choices[0].text);
  }

  console.log("done");
}

main().catch(console.error);
