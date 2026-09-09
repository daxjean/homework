
import { calculatorTool } from "./calculator.js";
import { timeTool } from "./timeTool.js";
import { weatherTool } from "./weatherTool.js";

// 註冊所有工具
const toolsRegistry = {
  [calculatorTool.definition.function.name]: calculatorTool,
  [timeTool.definition.function.name]: timeTool,
  [weatherTool.definition.function.name]: weatherTool
};

// 取得所有提供給 OpenAI 的工具定義陣列
export function getToolsDefinition() {
  return Object.values(toolsRegistry).map(tool => tool.definition);
}

// 根據 AI 傳回的名稱執行對應的工具
export async function handleToolCall(toolName, argsString) {
  const tool = toolsRegistry[toolName];
  if (!tool) {
    throw new Error(`找不到工具：${toolName}`);
  }
  const args = JSON.parse(argsString);
  return await tool.handler(args);
}
