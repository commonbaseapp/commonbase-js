// import { Configuration, OpenAIApi } from "openai";
import { Configuration, OpenAIApi } from "./openai";

async function main() {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);

  const completion = await openai.createCompletion({
    model: "text-davinci-003",
    // prompt: "Hello World!",
    projectId: "xxx",
    variables: {
      user: "Alice",
    },
  });
  console.log(completion.data.choices[0].text);
}

main().catch(console.error);
