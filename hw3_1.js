import { input } from "@inquirer/prompts";
import { initializeDatabase } from "./initKnowledge.js";
import { getEmbedding } from "./utils/embeddings.js";
import { searchKnowledge } from "./db/vectorDB.js";

async function runInteractiveSearch() {
  // 1. 初始化資料庫（把 5 筆城市資料轉成向量存入記憶體）
  await initializeDatabase();

  console.log("=== 🔍 歡迎使用台灣城市語意搜尋系統 ===");
  console.log("你可以輸入任何你想體驗的場景、食物或景點描述，系統會自動幫你匹配最適合的城市！");
  console.log("（輸入 exit 可隨時結束程式）\n");

  try {
    // 2. 實作無限對話迴圈
    while (true) {
      const userQuery = (
        await input({ message: "請輸入你想尋找的城市特色或行程敘述：" })
      ).trim();

      // 如果輸入空白則繼續等待
      if (userQuery === "") continue;

      // 檢查是否要離開程式
      if (userQuery.toLowerCase() === "exit") {
        console.log("感謝使用！祝你旅途愉快！👋");
        break;
      }

      console.log("\n⏳ 正在分析您的敘述並計算向量相似度...");

      // 3. 將使用者的輸入轉換為向量
      const queryEmbedding = await getEmbedding(userQuery);
      
      // 4. 從向量資料庫搜尋最相關的前 1 筆結果
      const [bestMatch] = searchKnowledge(queryEmbedding, 1);

      // 5. 印出搜尋結果
      console.log("\n==================== 🎯 搜尋結果 ====================");
      console.log(`推 薦 城 市：【${bestMatch.title}】`);
      console.log(`語意相似度：${(bestMatch.similarity * 100).toFixed(2)}%`);
      console.log(`文 章 摘 要：${bestMatch.content}`);
      console.log("====================================================\n");
    }
  } catch (err) {
    if (err.name === "ExitPromptError") {
      console.log("\n感謝使用！祝你旅途愉快！👋");
    } else {
      throw err;
    }
  }
}

runInteractiveSearch().catch(console.error);
