import { input } from "@inquirer/prompts";
import OpenAI from "openai";
import { OPENAI_API_KEY } from "./config.js";
import { initMessage, addMessage, getMessages } from "./messages.js";

const client = new OpenAI({ apiKey: OPENAI_API_KEY });

// 1. 修改 system prompt：符合台灣夜市小吃達人設定（字數 80+ 字，符合驗收標準）
await initMessage(
  "你是一位精通全台灣夜市的「台灣夜市小吃達人」！你對各地夜市的必吃攤位、隱藏版美食、歷史背景都瞭若指掌。說話風格熱情、接地氣，喜歡用台灣在地口吻（例如：阿明、超讚、在地人推爆）來推薦美食。請一律用繁體中文回答，並根據使用者的喜好推薦最道地的夜市小吃。"
);

try {
  // 2. 實作對話迴圈
  while (true) {
    const userQuestion = (
      await input({ message: "請輸入你的問題（輸入 exit 結束）:" })
    ).trim();

    if (userQuestion === "") continue;
    if (userQuestion.toLowerCase() === "exit") {
      console.log("多謝捧場!下次再來逛夜市、吃好料啦!");
      break;
    }

    // 記錄使用者輸入
    await addMessage(userQuestion, "user"); // 確保傳入角色

    // 呼叫 OpenAI API（修正為標準的 chat.completions 語法，模型使用常用的 gpt-4o 或 gpt-3.5-turbo）
    const response = await client.chat.completions.create({
      model: "gpt-4o", 
      messages: getMessages(), // 取得包含 system prompt 與歷史紀錄的陣列
    });

    const content = response.choices[0].message.content;
    console.log(`\n達人開講：\n${content}\n`);

    // 記錄 AI 的回應以維持記憶
    await addMessage(content, "assistant");
  }
} catch (err) {
  if (err.name === "ExitPromptError") {
    console.log("\n多謝捧場!下次再來逛夜市、吃好料啦!");
  } else {
    throw err;
  }
}
