import process from "process";

// import { Client } from "@commonbase/sdk";
import { Client } from "../index";

async function main() {
  const client = new Client({
    projectId: process.env.CB_PROJECT_ID,
  });
  const completionResult = await client.createCompletion({
    user_name: "Alice",
    project_name: "my-galaxy",
  });
  console.log(completionResult.bestResult);
}

main().catch(console.error);
