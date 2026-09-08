import { initializeDatabase } from "./initKnowledge.js";
import { getEmbedding } from "./utils/embeddings.js";
import { searchKnowledge } from "./db/vectorDb.js";

async function runSearchTest() {
  // 1. 初始化資料庫
  await initializeDatabase();

  // 2. 定義 3 種不同問法進行測試
  const testQueries = [
    "我想去吃牛肉湯和看古蹟，應該去哪裡？", 
    "哪裡可以看到漂亮的自然大山大水跟國家公園？",
    "想去拍網美照片、逛大型餐廳和看夕陽濕地"
  ];

  console.log("=== 開始執行 3 種不同問法的語意搜尋測試 ===\n");

  for (let i = 0; i < testQueries.length; i++) {
    const query = testQueries[i];
    console.log(`測試問法 ${i + 1}："${query}"`);

    // 將問題轉為向量
    const queryEmbedding = await getEmbedding(query);
    
    // 從向量資料庫搜尋最相關的前 1 筆結果
    const [bestMatch] = searchKnowledge(queryEmbedding, 1);

    console.log(`系統推薦城市：【${bestMatch.title}】`);
    console.log(`向量相似度分數：${bestMatch.similarity.toFixed(4)}`);
    console.log(`匹配內容摘要：${bestMatch.content}`);
    console.log("--------------------------------------------------\n");
  }
}

runSearchTest().catch(console.error);
