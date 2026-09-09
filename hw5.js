import { input } from "@inquirer/prompts";
import { getEmbedding, cosineSimilarity } from "./utils/embeddings.js";

async function runInteractiveExperiment() {

  console.log("您可以任意輸入兩句話，系統會透過 OpenAI 向量模型計算出它們的語意關聯度。");
  console.log("（在任意輸入框輸入 exit 可結束程式）\n");

  try {
    while (true) {
      // 1. 讓使用者輸入第一個句子
      const sentence1 = (
        await input({ message: "請輸入第一個句子：" })
      ).trim();
      if (sentence1.toLowerCase() === "exit" || sentence1 === "") {
        console.log("實驗結束，謝謝使用！");
        break;
      }

      // 2. 讓使用者輸入第二個句子
      const sentence2 = (
        await input({ message: " 請輸入第二個句子：" })
      ).trim();
      if (sentence2.toLowerCase() === "exit" || sentence2 === "") {
        console.log("實驗結束，謝謝使用！");
        break;
      }

      console.log("\n⏳ 正在將兩部句子傳送至 OpenAI 進行向量化 (Embedding)...");

      // 3. 呼叫 API 取得兩個句子的向量
      const vector1 = await getEmbedding(sentence1);
      const vector2 = await getEmbedding(sentence2);

      // 4. 計算兩者的餘弦相似度
      const score = cosineSimilarity(vector1, vector2);
      const percentage = (score * 100).toFixed(2);

      // 5. 輸出實驗結果
      console.log("\n==================== 📊 實驗結果 ====================");
      console.log(`句子 A：[ ${sentence1} ]`);
      console.log(`句子 B：[ ${sentence2} ]`);
      console.log(`----------------------------------------------------`);
      console.log(`餘弦相似度分數：${score.toFixed(4)}`);
      console.log(`語意關聯百分比：${percentage}%`);
      
      // 根據分數給予簡單的語意評語
      if (score > 0.6) {
        console.log("📢 評語：這兩句話意思高度相關，模型成功理解了它們的共通語意！");
      } else if (score > 0.3) {
        console.log("📢 評語：這兩句話有部分關聯或共享某些現實邏輯背景。");
      } else {
        console.log("📢 評語：這兩句話在向量空間中距離遙遠，屬於完全不相關的內容。");
      }
      console.log("====================================================\n");
    }
  } catch (err) {
    if (err.name === "ExitPromptError") {
      console.log("\n實驗結束，謝謝使用！👋");
    } else {
      throw err;
    }
  }
}

runInteractiveExperiment().catch(console.error);
