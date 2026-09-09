import { z } from "zod";
import { zodFunction } from "openai/helpers/zod";
import { OPENWEATHER_API_KEY } from "../config.js";

// 1. 使用實作函數串接 OpenWeather API
async function getWeather({ city }) {
  const url = new URL("https://api.openweathermap.org/data/2.5/weather");
  url.searchParams.set("q", city);
  url.searchParams.set("appid", OPENWEATHER_API_KEY);
  url.searchParams.set("units", "metric");
  url.searchParams.set("lang", "zh_tw");

  const res = await fetch(url);
  if (!res.ok) return { error: `OpenWeather API error: ${res.status}` };
  
  const data = await res.json();
  return {
    city: data.name,
    temperature: data.main.temp,
    humidity: data.main.humidity,
    description: data.weather[0].description, // 修正原先漏掉的陣列索引 [0]
  };
}

// 2. 使用 zodFunction 定義並導出工具
export const weatherTool = {
  // 透過 zodFunction 自動生成包含 strict: true 的工具定義
  definition: zodFunction({
    name: "get_weather",
    description: "取得指定城市的即時天氣資訊，包括溫度、濕度、天氣狀況等。",
    parameters: z.object({
      city: z.string().describe("城市名稱（英文），如 Taipei 或 Tokyo"),
    }),
  }),
  handler: async (args) => {
    return JSON.stringify(await getWeather({ city: args.city }));
  }
};
