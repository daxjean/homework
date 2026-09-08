function calculateImplementation(expression) {
  // 僅允許數字、四則運算符號、括號、小數點與空格
  const safeExpression = expression.replace(/[^0-9+\-*/().\s]/g, "");
  try {
    // 使用 Function 替代 eval 以提高安全度
    const result = new Function(`return ${safeExpression}`)();
    return JSON.stringify({ success: true, result: result });
  } catch (error) {
    return JSON.stringify({ success: false, error: "無法解析該數學運算式" });
  }
}

// 定義工具的 JSON Schema 與導出物件
export const calculatorTool = {
  definition: {
    type: "function",
    function: {
      name: "calculate",
      description: "進行數學四則運算，包含加、減、乘、除與括號運算。",
      parameters: {
        type: "object",
        properties: {
          expression: {
            type: "string",
            description: "要計算的數學表達式，例如：'10 + 5 * 2' 或 '(120 - 20) / 4'"
          }
        },
        required: ["expression"]
      }
    }
  },
  handler: async (args) => {
    return calculateImplementation(args.expression);
  }
};
