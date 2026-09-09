import { input } from "@inquirer/prompts";
import OpenAI from "openai";
import { OPENAI_API_KEY } from "./config.js";
import { initializeDatabase } from "./initKnowledge.js";
import { getEmbedding } from "./utils/embeddings.js";
import { searchKnowledge } from "./db/vectorDb.js";
import { initMessage, addMessage, getMessages } from "./messages.js";

const client = new OpenAI({ apiKey: OPENAI_API_KEY });

// 1. 初始化資料庫（預先載入 5 筆城市知識的向量）
await initializeDatabase();

// 2. 初始化對話管理與 System Prompt 
await initMessage(
  "你是一位專業的台灣旅遊嚮導。當使用者詢問關於台灣城市的行程、特色或推薦時，系統會為你檢索出相關的「真實背景知識」。請你務必結合這些背景知識，用親切、詳細的口吻為使用者解答。如果背景知識與問題無關，請保持客觀回答。"
);

console.log("=== 歡迎使用台灣城市 RAG 旅遊助理 ===");
console.log("（輸入 exit 結束對話）\n");

try {
  while (true) {
    const userQuestion = (
      await input({ message: "請輸入你想詢問的旅遊喜好或場景描述：" })
    ).trim();

    if (userQuestion === "") continue;
    if (userQuestion.toLowerCase() === "exit") {
      console.log("祝您旅途愉快，再會!");
      break;
    }

    console.log("正在從知識庫檢索最相關的城市背景資料...");

    // 【RAG 核心步驟 1：檢索】將使用者問題轉為向量，並撈出前 1 筆最相關的城市資料
    const queryEmbedding = await getEmbedding(userQuestion);
    const [bestMatch] = searchKnowledge(queryEmbedding, 1);

    console.log(`[知識庫撈取成功] 匹配到：【${bestMatch.title}】(相似度: ${(bestMatch.similarity * 100).toFixed(1)}%)`);

    // 【RAG 核心步驟 2：增強】將撈出來的知識封裝成一個特殊的 Prompt
    const augmentedPrompt = `
【使用者真實問題】：${userQuestion}
【系統檢索出的城市背景知識】：
城市：${bestMatch.title}
內容：${bestMatch.content}

請結合上述背景知識，特別針對【${bestMatch.title}】的特色，詳細回答使用者的問題。`;

    // 將包裝後的內容作為 user 角色記錄進對話歷史中
    await addMessage(augmentedPrompt, "user");

    // 【RAG 核心步驟 3：生成】將含有背景知識的完整訊息丟給 OpenAI 生成回答
    const response = await client.chat.completions.create({
      //model: "gpt-4o", // 或符合您課程要求的模型
      model:"GPT-5.4 mini",
      messages: getMessages(),
    });

    const aiReply = response.choices[0].message.content;
    console.log(`\n嚮導回答：\n${aiReply}\n`);

    // 記錄 AI 的最終回應以維持記憶
    await addMessage(aiReply, "assistant");
  }
} catch (err) {
  if (err.name === "ExitPromptError") {
    console.log("\n祝您旅途愉快，再會!");
  } else {
    throw err;
  }
}
