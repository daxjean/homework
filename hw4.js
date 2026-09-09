import { input } from "@inquirer/prompts";
import OpenAI from "openai";
import { OPENAI_API_KEY } from "./config.js";
import { initMessage, addMessage, getMessages, addToolMessage, addAssistantToolCallMessage } from "./messages.js";
import { getToolsDefinition, handleToolCall } from "./tools/registry.js";

const client = new OpenAI({ apiKey: OPENAI_API_KEY });

// 3. 設計 system prompt，說明能查詢即時天氣與現在時間
await initMessage(
  "你是一位貼心的生活智慧助理。你擁有查詢「目前精確時間」與「全球城市即時天氣」的能力。當使用者詢問時間或天氣時，請務必發動對應的工具。特別注意：天氣工具 get_weather 的城市參數必須是英文（例如：使用者問台北，請代入 'Taipei'；問東京，請代入 'Tokyo'），請自動幫使用者轉換。如果同時問兩個問題，請同時發動兩個工具並整合回答。"
);

try {
  while (true) {
    const userQuestion = (await input({ message: "\n請輸入你的問題（輸入 exit 結束）：" })).trim();

    if (userQuestion === "") continue;
    if (userQuestion.toLowerCase() === "exit") {
      console.log("再會！祝你有美好的一天!");
      break;
    }

    await addMessage(userQuestion, "user");

    // 第一次呼叫：帶入雙工具定義
    let response = await client.chat.completions.create({
      model: "gpt-4o", 
      messages: getMessages(),
      tools: getToolsDefinition(), 
    });

    let assistantMessage = response.choices[0].message;

    // 檢查 AI 是否決定呼叫工具 (可包含多個工具呼叫)
    if (assistantMessage.tool_calls) {
      console.log("\n  [系統通知] AI 決定發動 Function Calling 工具...");
      
      // 記錄助理發出的工具呼叫清單
      await addAssistantToolCallMessage(assistantMessage.tool_calls);

      // 迴圈遍歷所有被觸發的工具（完美解決同時問兩個問題的情況）
      for (const toolCall of assistantMessage.tool_calls) {
        const toolName = toolCall.function.name;
        const toolArgs = toolCall.function.arguments;
        
        console.log(` [執行工具] 名稱: ${toolName} | 參數: ${toolArgs}`);

        // 執行對應的 handler 取得結果
        const toolResult = await handleToolCall(toolName, toolArgs);
        console.log(`[工具回傳] 結果: ${toolResult}`);

        // 將結果以 role: "tool" 寫入歷史紀錄
        await addToolMessage(toolCall.id, toolResult);
      }

      // 第二次呼叫：將工具算出的真實數據餵回 AI 進行整合
      response = await client.chat.completions.create({
        model: "gpt-4o",
        messages: getMessages(),
      });
      
      assistantMessage = response.choices[0].message;
    }

    // 輸出助理最終整合的親切回答
    const finalContent = assistantMessage.content;
    console.log(`\n助理回答：\n${finalContent}\n`);
    await addMessage(finalContent, "assistant");
  }
} catch (err) {
  if (err.name === "ExitPromptError") {
    console.log("\n再會！祝你有美好的一天!");
  } else {
    throw err;
  }
}
