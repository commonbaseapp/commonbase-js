import { Client } from "./index";

async function main() {
  const client = new Client({
    projectId: "xxx",
  });
  const completionResult = await client.createCompletion({
    user_name: "Alice",
    project_name: "my-galaxy",
  });
  console.log(completionResult.bestResult);
}

main().catch(console.error);
