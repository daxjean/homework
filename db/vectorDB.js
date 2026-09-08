import { cosineSimilarity } from "../utils/embeddings.js";

// 記憶體向量資料庫儲存陣列
const vectorStorage = [];

/**
 * 將知識與其對應的向量存入資料庫
 * @param {string} title 標題（城市名）
 * @param {string} content 詳細介紹內容
 * @param {number[]} embedding 向量資料
 */
export function insertKnowledge(title, content, embedding) {
  vectorStorage.push({ title, content, embedding });
}

/**
 * 透過輸入的向量，在資料庫中搜尋最相似的知識
 * @param {number[]} queryEmbedding 搜尋問題的向量
 * @param {number} topK 取前幾筆最相關的結果
 */
export function searchKnowledge(queryEmbedding, topK = 1) {
  // 計算資料庫內每筆資料與問題向量的相似度
  const results = vectorStorage.map((item) => {
    const similarity = cosineSimilarity(queryEmbedding, item.embedding);
    return {
      title: item.title,
      content: item.content,
      similarity: similarity,
    };
  });

  // 依相似度由高到低排序，並取出前 topK 筆
  return results.sort((a, b) => b.similarity - a.similarity).slice(0, topK);
}
