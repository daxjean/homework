import { input } from "@inquirer/prompts";
import OpenAI from "openai";
import { OPENAI_API_KEY } from "./config.js";
// 引入你的 messages 管理（請確保有實作 addToolMessage 與 addAssistantToolCallMessage）
import { initMessage, addMessage, getMessages, addToolMessage, addAssistantToolCallMessage } from "./messages.js";
// 引入你的計算機工具中心
import { getToolsDefinition, handleToolCall } from "./tools/registry.js";

const client = new OpenAI({ apiKey: OPENAI_API_KEY });

// 1. 初始化 System Prompt（融合夜市小吃達人設定 + 工具使用提示，共 130 字以上）
await initMessage(
  "你是一位精通全台灣夜市的「台灣夜市小吃達人」！你對各地夜市的必吃攤位、隱藏版美食、歷史背景都瞭若指掌。說話風格熱情、接地氣，喜歡用台灣在地口吻（例如：阿明、超讚、在地人推爆）來推薦美食。請一律用繁體中文回答。另外，如果使用者提到任何關於夜市消費、預算分攤、小吃價格加總等數學計算，請務必使用 calculate 工具來算給他聽！"
);

try {
  // 2. 實作對話迴圈
  while (true) {
    const userQuestion = (
      await input({ message: "\n請輸入你的問題（輸入 exit 結束）: " })
    ).trim();

    if (userQuestion === "") continue;
    if (userQuestion.toLowerCase() === "exit") {
      console.log("多謝捧場！下次再來逛夜市、吃好料啦！👋");
      break;
    }

    // 記錄使用者輸入
    await addMessage(userQuestion, "user");

    // 第一次呼叫 API：同時帶入對話歷史紀錄與工具定義
    let response = await client.chat.completions.create({
      model: "gpt-5.6-luna", // 保持你課程所規定的模型名稱，或改用 gpt-4o
      messages: getMessages(),
      tools: getToolsDefinition(), // 註冊你的計算機工具
    });

    let assistantMessage = response.choices[0].message;

    // 檢查 AI 是否決定發動 Function Calling 工具
    if (assistantMessage.tool_calls) {
      console.log("\n🤖 達人正在使用工具掐指一算...");
      
      // 記錄助理發送的工具呼叫請求
      await addAssistantToolCallMessage(assistantMessage.tool_calls);

      // 處理每一個工具呼叫
      for (const toolCall of assistantMessage.tool_calls) {
        const toolName = toolCall.function.name;
        const toolArgs = toolCall.function.arguments;
        
        console.log(`🔧 [呼叫工具]: ${toolName} | 參數: ${toolArgs}`);

        // 執行實作函數取得運算結果
        const toolResult = await handleToolCall(toolName, toolArgs);
        console.log(`📊 [工具回傳]: ${toolResult}`);

        // 將工具運算結果寫入歷史紀錄
        await addToolMessage(toolCall.id, toolResult);
      }

      // 第二次呼叫 API：把工具算的正確結果回傳給 AI，讓它用達人的口吻組織最終回答
      response = await client.chat.completions.create({
        model: "gpt-5.6-luna",
        messages: getMessages(),
      });
      
      assistantMessage = response.choices[0].message;
    }

    // 輸出最終 AI 解答
    const finalContent = assistantMessage.content;
    console.log(`\n達人開講：\n${finalContent}\n`);
    
    // 記錄 AI 的回應以維持記憶
    await addMessage(finalContent, "assistant");
  }
} catch (err) {
  if (err.name === "ExitPromptError") {
    console.log("\n多謝捧場！下次再來逛夜市、吃好料啦！👋");
  } else {
    throw err;
  }
}
