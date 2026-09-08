import { mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";

const HISTORY_DIR = ".history";

if (!existsSync(HISTORY_DIR)) {
  mkdirSync(HISTORY_DIR, { recursive: true });
}

const filename = `${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
const filepath = join(HISTORY_DIR, filename);

const adapter = new JSONFile(filepath);
const db = new Low(adapter, { messages: [] });

await db.read();
let messages = [];

export async function initMessage(systemPrompt) {
  if (db.data.messages.length === 0) {
    db.data.messages.push({ role: "developer", content: systemPrompt });
    await db.write();
  }
}

export async function addMessage(content, role = "user") {
  db.data.messages.push({ role, content });
  await db.write();
}

// 專門處理 Function Calling 的工具回傳紀錄
export async function addToolMessage(toolCallId, content) {
  messages.push({
    role: "tool",
    tool_call_id: toolCallId,
    content: content
  });
}

// 專門處理 AI 發出工具呼叫請求時的紀錄
export async function addAssistantToolCallMessage(toolCalls) {
  messages.push({
    role: "assistant",
    tool_calls: toolCalls
  });
}

export function getMessages() {
  return db.data.messages;
}
