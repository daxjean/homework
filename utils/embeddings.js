import OpenAI from "openai";
import { OPENAI_API_KEY } from "../config.js";

const client = new OpenAI({ apiKey: OPENAI_API_KEY });

/**
 * 將文字轉換為向量 (Embedding)
 * @param {string} text 
 * @returns {Promise<number[]>} 向量陣列
 */
export async function getEmbedding(text) {
  const response = await client.embeddings.create({
    model: "text-embedding-3-small", // 課程常用的輕量高效率模型
    input: text,
  });
  return response.data[0].embedding;
}

/**
 * 計算兩個向量之間的餘弦相似度 (Cosine Similarity)
 */
export function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
