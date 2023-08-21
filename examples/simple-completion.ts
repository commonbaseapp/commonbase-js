import * as process from "process";

// import { Client } from "@commonbase/sdk";
import { Client } from "../index";

async function main() {
  const client = new Client({
    apiKey: process.env.CB_API_KEY!,
    projectId: process.env.CB_PROJECT_ID,
  });
  const result = await client.createCompletion({
    prompt: "Greet our new customer with the name {{user}} who just signed up.",
    variables: {
      user: "Alice",
    },
  });
  console.log(result.bestChoice.text);
}

main().catch(console.error);
