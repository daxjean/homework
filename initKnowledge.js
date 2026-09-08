import { getEmbedding } from "./utils/embeddings.js";
import { insertKnowledge } from "./db/vectorDb.js";

// 準備 5 筆台灣城市介紹資料
const taiwanCitiesData = [
  {
    title: "台北市",
    content: "台灣的政治、經濟與文化中心。擁有指標性地標台北101、豐富 mail 的捷運網路、歷史悠久的西門町以及故宮博物院，是一個現代與傳統交織的國際大都市。"
  },
  {
    title: "台中市",
    content: "位於台灣中部，氣候宜人。以豐富的文創市集（如審計新村）、逢甲夜市美食、高美濕地的夕陽美景以及獨特的「大坪數大空間」特色餐廳建築聞名。"
  },
  {
    title: "高雄市",
    content: "南方第一大港口城市。著名的景點包括駁二藝術特區、愛河河畔、旗津海鮮，擁有寬廣的街道與熱情的陽光，近年更轉型為充滿活力的大港藝文重鎮。"
  },
  {
    title: "台南市",
    content: "台灣的歷史古都，文化發源地。以安平古堡、赤崁樓等古蹟著稱，更是全台公認的美食之都，牛肉湯、鱔魚意麵、擔仔麵等在地傳統小吃讓饕客流連忘返。"
  },
  {
    title: "花蓮縣",
    content: "位於台灣東部，背山面海，自然景觀磅礡。擁有世界級絕景太魯閣國家公園、鬼斧神工的清水斷崖以及七星潭的礫石海灘，是親近大自然與放鬆度假的首選。"
  }
];

/**
 * 執行初始化，將文字轉換成向量並存入
 */
export async function initializeDatabase() {
  console.log("正在將 5 筆城市知識進行 Embedding 向量化並匯入資料庫...");
  
  for (const city of taiwanCitiesData) {
    const embedding = await getEmbedding(city.content);
    insertKnowledge(city.title, city.content, embedding);
  }
  
  console.log("知識庫初始化成功！已成功載入 5 筆城市資料。\n");
}
