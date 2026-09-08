import { input } from "@inquirer/prompts";
import OpenAI from "openai";
import { OPENAI_API_KEY } from "./config.js";
const client = new OpenAI({ apiKey: OPENAI_API_KEY });
const userQuestion = await input({ message: "請輸入你的問題：" });
const response = await client.responses.create({
model: "gpt-5.6-luna",
instructions:
"你是⼀位專⾨講關於貓的笑話⼤師，請⽤繁體中⽂回答。請⽤幽默有趣的⽅式回應。",
input: userQuestion,
});
console.log(response.output_text);
