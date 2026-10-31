// Display metadata only: retain no provenance paths, prompts, raw tool results or URLs.
const TOOL_TITLES = {
  list_contractors: "Contractors", get_contractor_details: "Contractor profile",
  list_service_contracts: "Service contracts", get_service_contract_details: "Service contract",
  list_service_invoices: "Service invoices", get_service_invoice_details: "Service invoice",
  list_service_invoice_lines: "Service invoice lines", list_contractor_payments: "Contractor payments",
  get_contractor_ledger: "Contractor ledger", get_contractor_summary: "Contractor financial summary",
  get_service_contracts_summary: "Service contract summary", get_service_invoices_summary: "Service invoice summary",
  get_contractor_payments_summary: "Contractor payment summary", list_expenses: "Expenses",
  get_expense_details: "Expense details", list_expense_history: "Expense change history",
  get_expense_summary: "Expense summary", get_expense_history_summary: "Expense history summary",
};

function invalid() { const error = new Error("Invalid Business Analyst response"); error.aiCode = "invalid"; throw error; }
function text(value, max) { if (typeof value !== "string" || value.length > max) invalid(); return value; }

export function readBusinessMessage(raw) {
  if (!raw || !Number.isSafeInteger(raw.id) || raw.id < 1 || !["user", "assistant"].includes(raw.role)
      || !["pending", "complete", "failed"].includes(raw.state) || !Array.isArray(raw.sources) || raw.sources.length > 32) invalid();
  const sources = raw.sources.map((source) => {
    if (!source || !["document", "tool"].includes(source.kind)) invalid();
    const section = text(source.evidence_id, 64);
    if (source.kind === "document") return { kind: "document", document_id: text(source.document_id, 96),
      section_id: section, document_title: text(source.title, 1000), heading: "" };
    const toolId = text(source.tool_id, 100);
    if (!/^[a-z][a-z0-9_.]*$/.test(toolId)) invalid();
    const date = text(source.executed_at, 80);
    if (!Number.isFinite(new Date(date).getTime())) invalid();
    return { kind: "tool", document_id: `tool:${toolId}`, section_id: section,
      document_title: TOOL_TITLES[toolId] || toolId.replaceAll("_", " "), heading: date };
  });
  const content = text(raw.content, 100000);
  if (!content.trim()) invalid();
  return { id: raw.id, role: raw.role, state: raw.state, kind: text(raw.kind, 40), content,
    sources, stale_sources: raw.stale_sources === true, historical_observation: raw.historical_observation === true,
    created_at: text(raw.created_at, 80) };
}
