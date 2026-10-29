import instance from "../../../api/axiosInstance";

// Non-streaming turns default to 90s on Django, with a provider operation that
// can finish near the deadline. Keep a 150s client budget; never retry POST here.
export const CHAT_TIMEOUT_MS = 150000;
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export const isConversationId = (value) => typeof value === "string" && uuid.test(value);

function invalid() { const error = new Error("Invalid assistant response"); error.aiCode = "invalid"; throw error; }
function pageNumber(value) { if (!Number.isInteger(value) || value < 0 || value > 10000) invalid(); return value; }
function nextPage(value) { return value === null ? null : pageNumber(value); }
function text(value, max) { if (typeof value !== "string" || value.length > max) invalid(); return value; }

export function readMessage(raw) {
  if (!raw || !["assistant", "user"].includes(raw.role) || !["complete", "pending", "failed"].includes(raw.state)
      || !["string", "number"].includes(typeof raw.id) || !Array.isArray(raw.sources) || raw.sources.length > 20) invalid();
  const sources = raw.sources.map((source) => {
    if (!source || !["source_verified", "runtime_verified", "automated_test_verified"].includes(source.verification_status)) invalid();
    // Only public display metadata. Paths, tokens, prompts and arbitrary URLs
    // are not retained, even if an unexpected response includes them.
    return { document_id: text(source.document_id, 250), section_id: text(source.section_id, 350),
      document_title: text(source.document_title, 1000), heading: text(source.heading, 1000) };
  });
  const content = text(raw.content, 100000);
  if (!content.trim() || (typeof raw.id === "number" && (!Number.isInteger(raw.id) || raw.id < 1))) invalid();
  return { id: raw.id, role: raw.role, content, kind: text(raw.kind, 40), state: raw.state,
    stale_sources: raw.stale_sources === true, sources, created_at: text(raw.created_at, 80) };
}

export function errorCategory(error) {
  if (error.aiCode) return error.aiCode;
  if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") return "timeout";
  const status = error.response?.status;
  const code = error.response?.data?.error?.code;
  if (status === 401) return "authentication";
  if (status === 403) return "permission";
  if (status === 404) return "notFound";
  if (status === 409) return "busy";
  if (status === 429) return "rateLimit";
  if (status === 400 || status === 413 || code === "invalid_message") return "validation";
  if (["provider_not_configured", "configuration_invalid", "provider_configuration"].includes(code)) return "configuration";
  if (typeof code === "string" && /^(index_|documentation_|sources_|evidence_)/.test(code)) return "documentation";
  if (typeof code === "string" && code.startsWith("provider_")) return "provider";
  return status ? "unavailable" : "network";
}

export const aiChatApi = {
  async send(message, conversationId, language, signal) {
    if (conversationId !== null && !isConversationId(conversationId)) invalid();
    const response = await instance.post("/assistant/chat/", { message, ...(conversationId ? { conversation_id: conversationId } : {}) },
      { signal, timeout: CHAT_TIMEOUT_MS, preserveAuthFailure: true, headers: { "Accept-Language": language } });
    const data = response.data;
    if (!data || !isConversationId(data.conversation_id) || !isConversationId(data.request_id)
        || (conversationId && data.conversation_id !== conversationId)) invalid();
    const reply = readMessage(data.message);
    if (reply.role !== "assistant" || reply.state !== "complete") invalid();
    return { conversationId: data.conversation_id, message: reply };
  },
  async conversations(page = 0, signal) {
    const response = await instance.get("/assistant/conversations/", { params: { page: pageNumber(page) }, signal, timeout: 20000, preserveAuthFailure: true });
    const data = response.data;
    if (!data || !Array.isArray(data.results) || data.results.length > 20) invalid();
    return { results: data.results.map((item) => {
      if (!isConversationId(item.id)) invalid();
      return { id: item.id, title: text(item.title, 1000) };
    }), nextPage: nextPage(data.next_page) };
  },
  async messages(id, page = 0, signal) {
    if (!isConversationId(id)) invalid();
    const response = await instance.get(`/assistant/conversations/${id}/messages/`, { params: { page: pageNumber(page) }, signal, timeout: 20000, preserveAuthFailure: true });
    const data = response.data;
    if (!data || data.conversation_id !== id || !Array.isArray(data.results) || data.results.length > 40) invalid();
    return { results: data.results.map(readMessage), nextPage: nextPage(data.next_page) };
  },
};
