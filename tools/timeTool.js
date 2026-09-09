import { z } from "zod";
import { zodFunction } from "openai/helpers/zod";

export const timeTool = {
  definition: zodFunction({
    name: "getCurrentTime",
    description: "取得目前的精確日期與時間（台灣標準時間）。",
    parameters: z.object({}), // 空物件表示不需要參數
  }),
  handler: async () => {
    const now = new Date();
    const taipeiTime = now.toLocaleString("zh-TW", { timeZone: "Asia/Taipei" });
    return JSON.stringify({ success: true, formattedTime: taipeiTime });
  }
};
