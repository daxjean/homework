import { OPENWEATHER_API_KEY } from "../config.js";

// 實作函數：直接使用你提供的 OpenWeather API 串接程式碼
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
    description: data.weather[0].description,
  };
}

// 統一導出的工具物件
export const weatherTool = {
  // 將你的定義包在 definition 中，並補上 OpenAI 所需的 type: "function" 外殼
  definition: {
    type: "function",
    function: {
      name: "get_weather",
      description: "取得指定城市的即時天氣資訊，包括溫度、濕度、天氣狀況等。",
      parameters: {
        type: "object",
        properties: {
          city: {
            type: "string",
            description: "城市名稱（英文），如 Taipei 或 Tokyo",
          },
        },
        required: ["city"],
        additionalProperties: false,
      },
      strict: true,
    }
  },
  // 註冊中心呼叫的處理器
  handler: async (args) => {
    const result = await getWeather({ city: args.city });
    return JSON.stringify(result);
  }
};
