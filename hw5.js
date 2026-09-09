import { input } from "@inquirer/prompts";
import OpenAI from "openai";
import { OPENAI_API_KEY } from "./config.js";
import { getEmbedding, cosineSimilarity } from "./utils/embeddings.js";
import { initMessage, addMessage, getMessages } from "./messages.js";

const client = new OpenAI({ apiKey: OPENAI_API_KEY });

// 初始化對話紀錄與 System Prompt
await initMessage("你是一位幽默有趣的語言分析大師。請一律用繁體中文回答，根據使用者輸入的句子以及拆分出來的字詞相似度結果，給予一段充滿智慧、好玩且熱情的語意講評。");

//console.log("=== [中括號區塊] 語意相似度實驗室 ===");
//console.log("請用 [ ] 包裹你想比對的字串，例如：[我喜歡貓] [貓咪很可愛] [我養了一隻貓]");
console.log("（輸入 exit 結束程式）\n");

try {
  while (true) {
    const userInput = (
      await input({ message: "請輸入您的情境句子：" })
    ).trim();

    if (userInput === "") continue;
    if (userInput.toLowerCase() === "exit") {
      console.log("再會!");
      break;
    }

    //  修正正則表達式：移除錯誤的逗號，改為標準的 /g
    const matches = [...userInput.matchAll(/\[(.*?)\]/g)].map(m => m[1].trim());

    if (matches.length < 2) {
      console.log("提示：句子中至少需要包含兩個 [ ] 區塊才能進行相似度比對喔！\n");
      continue;
    }

    console.log(`\n 成功解析出 ${matches.length} 個比對區塊：${matches.map(m => `"${m}"`).join(", ")}`);
    console.log("正在計算區塊間的語意相似度...");

    // 【步驟一：區塊兩兩相似度實驗】
    const vectors = [];
    for (const text of matches) {
      const vec = await getEmbedding(text);
      vectors.push({ text, vec });
    }

    // 用來收集相似度結果，稍後一起餵給 AI 進行分析
    let similarityReport = "";

    console.log("\n====================  區塊相似度結果 ====================");
    for (let i = 0; i < vectors.length; i++) {
      for (let j = i + 1; j < vectors.length; j++) {
        const score = cosineSimilarity(vectors[i].vec, vectors[j].vec);
        const resultLine = ` [${vectors[i].text}] <-> [${vectors[j].text}] ➔ 相似度：${(score * 100).toFixed(2)}%\n`;
        console.log(resultLine.trim());
        similarityReport += resultLine;
      }
    }
    console.log("========================================================\n");

    // 【步驟二：將相似度數值與原句子組裝成 Prompt】
    const rAGPrompt = `
【使用者輸入句子】：${userInput}
【各區塊兩兩相似度計算結果】：
${similarityReport}

請根據上述的相似度數據，用你幽默有趣的風格，為這幾個詞彙的語意親切地開講評析！
`;

    await addMessage(rAGPrompt, "user");
    
    const response = await client.chat.completions.create({
      model: "gpt-5.6-luna", 
      messages: getMessages(),
    });

    // 修正回傳物件讀取邏輯
    const aiReply = response.choices[0]?.message?.content || "（無法取得回應）";
    console.log(`嚮導開講：\n${aiReply}\n`);
    console.log("-----------------------------------------------------------------------\n");

    // 記錄 AI 回應維持記憶
    await addMessage(aiReply, "assistant");
  }
} catch (err) {
  if (err.name === "ExitPromptError") {
    console.log("\n再會!");
  } else {
    throw err;
  }
}
