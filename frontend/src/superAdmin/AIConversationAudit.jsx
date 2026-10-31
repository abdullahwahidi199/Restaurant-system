import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ClipboardList, RefreshCw } from "lucide-react";
import instance from "../api/axiosInstance";
import SafeMarkdown from "../modules/ai/components/SafeMarkdown";
import "./ai-audit.css";

const base = "/assistant/audit";
const inputClass = "ai-audit-input rounded-md border px-3 py-2 text-sm min-w-0 w-full";
const buttonClass = "ai-audit-button rounded-md border px-3 py-2 text-sm font-medium disabled:opacity-40";
const pretty = (value) => JSON.stringify(value, null, 2);
const time = (value) => value ? new Date(value).toLocaleString() : "—";
const duration = (value) => value === null || value === undefined ? "Unavailable" : `${(value / 1000).toFixed(3)} s`;
const number = (value) => value === null || value === undefined ? "Not reported" : value.toLocaleString();
const agentLabel = (item) => item.agent_label || ({ operator_mentor: "Operator Mentor", business_analyst: "Business Analyst" }[item.agent_type]) || item.agent_type || "Operator Mentor";
const errorText = (error) => error.response?.status === 403 || error.response?.status === 401
  ? "SuperAdmin authorization is required to view AI audits."
  : "Audit data could not be loaded. Try again.";

function Json({ value }) {
  return <pre className="ai-audit-json max-h-96 overflow-auto whitespace-pre-wrap break-all rounded-md p-4 text-xs leading-relaxed">{pretty(value)}</pre>;
}
function Status({ value }) {
  const color = /failed|error|rejected/.test(value) ? "ai-audit-status-danger" : /completed|accepted|ok/.test(value) ? "ai-audit-status-success" : "ai-audit-status-neutral";
  return <span className={`rounded-full px-2 py-1 text-xs font-semibold ${color}`}>{value}</span>;
}
function Pages({ data, page, setPage }) {
  return <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 pt-4 text-sm">
    <span>{data.count ?? 0} records · Page {page}</span><div className="flex gap-2">
      <button className={buttonClass} disabled={!data.previous} onClick={() => setPage(page - 1)}>Previous</button>
      <button className={buttonClass} disabled={!data.next} onClick={() => setPage(page + 1)}>Next</button>
    </div></div>;
}
function Metrics({ turn }) {
  return <dl className="grid grid-cols-2 gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm sm:grid-cols-4">
    {[["Duration", duration(turn.duration_ms)], ["Model calls", `${turn.completed_model_calls} completed / ${turn.model_calls} attempted`],
      ["Tool calls", `${turn.completed_tool_calls} completed / ${turn.tool_calls} attempted`], ["Input tokens", number(turn.usage?.prompt_tokens)],
      ["Batches", number(turn.batches)], ["Operations", number(turn.operations)],
      ["Output tokens", number(turn.usage?.completion_tokens)], ["Cache hit tokens", number(turn.usage?.prompt_cache_hit_tokens)],
      ["Cache miss tokens", number(turn.usage?.prompt_cache_miss_tokens)], ["Estimated cost", "Unavailable"]].map(([label, value]) =>
      <div key={label}><dt className="text-gray-500">{label}</dt><dd className="mt-1 font-semibold text-gray-900">{value}</dd></div>)}
    {!turn.usage_complete && <p className="col-span-full text-amber-800">Usage is partial or was not reported by the provider.</p>}
    {turn.legacy_capture && <p className="col-span-full text-amber-800">Imported execution record. Only originally recorded metadata is available; model payloads and tool-start events were not reconstructed.</p>}
    {turn.model_configuration && <div className="col-span-full text-xs text-gray-600"><dt>Model settings</dt><dd>
      Requested: {turn.model_configuration.requested_model ?? "Server default"} · Thinking: {turn.model_configuration.requested_reasoning_effort ?? "Server default"}<br />
      {turn.model_calls ? <>Used: {turn.model_configuration.model} · Thinking: {turn.model_configuration.reasoning_effort}</> : "No model request (local response)"}
    </dd></div>}
  </dl>;
}

function EventPayload({ payload }) {
  const model = payload?.payload;
  const sections = payload?.result?.sections;
  const ranked = payload?.result?.results;
  return <div className="mt-4 space-y-4" data-testid="audit-event-payload">
    {payload?.capture_boundary && <p className="text-xs text-gray-500">Capture boundary: {payload.capture_boundary}</p>}
    {Array.isArray(model?.messages) && <ol className="space-y-3" aria-label="Messages sent to model">
      {model.messages.map((message, index) => <li key={index} className="rounded border border-gray-200 p-3"><p className="mb-2 text-xs font-semibold uppercase">{index + 1}. {message.role}</p>
        <Json value={message} /></li>)}
    </ol>}
    {Array.isArray(ranked) && <div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead><tr><th>Rank</th><th>Document / section</th><th>Module</th><th>Relevance score</th></tr></thead>
      <tbody>{ranked.map((item,index) => <tr key={index} className="border-t"><td className="p-2">{item.rank ?? index + 1}</td><td className="max-w-md break-all p-2"><strong>{item.document_title || item.document_id}</strong><p>{item.title}</p><p className="text-gray-500">{item.document_id}<br />{item.section_id}</p><p>{item.summary}</p></td><td className="p-2">{item.module}</td><td className="p-2">{typeof item.relevance_score === "number" ? item.relevance_score.toFixed(4) : "Not reported"}</td></tr>)}</tbody></table></div>}
    {Array.isArray(sections) && sections.map((section,index) => <details className="rounded-md border border-gray-200 p-3" key={index}>
      <summary className="cursor-pointer text-sm font-semibold">{section.heading} · {section.is_partial ? "Partial" : "Complete"} evidence</summary>
      <p className="my-2 break-all text-xs text-gray-500">{section.document_id} · {section.section_id}</p>
      <p className="mb-2 break-all text-xs text-gray-500">{section.verification_status || "Verification not reported"}{section.content_range ? ` · Characters ${section.content_range.start}–${section.content_range.end} of ${section.content_range.total}` : ""}{section.content_hash ? ` · SHA-256 ${section.content_hash}` : ""}</p>
      <div className="max-h-96 overflow-auto text-sm"><SafeMarkdown text={section.content || ""} /></div>
    </details>)}
    <details open={!model?.messages && !sections && !ranked}><summary className="mb-2 cursor-pointer text-sm font-medium">Complete redacted payload</summary><Json value={payload} /></details>
  </div>;
}

function TurnDetail({ id, close }) {
  const [turn, setTurn] = useState(null);
  const [events, setEvents] = useState([]);
  const [page, setPage] = useState(1);
  const [next, setNext] = useState(false);
  const [error, setError] = useState("");
  const [opened, setOpened] = useState(null);
  const [payloads, setPayloads] = useState({});
  useEffect(() => {
    const controller = new AbortController();
    instance.get(`${base}/turns/${id}/`, { signal:controller.signal, preserveAuthFailure:true }).then(({ data }) => setTurn(data))
      .catch((e) => { if (!controller.signal.aborted) setError(errorText(e)); });
    return () => controller.abort();
  }, [id]);
  useEffect(() => {
    const controller = new AbortController();
    instance.get(`${base}/turns/${id}/events/`, { params:{ page, page_size:50 }, signal:controller.signal, preserveAuthFailure:true }).then(({ data }) => {
      setEvents((old) => page === 1 ? data.results : [...old, ...data.results]); setNext(Boolean(data.next));
    }).catch((e) => { if (!controller.signal.aborted) setError(errorText(e)); });
    return () => controller.abort();
  }, [id,page]);
  useEffect(() => {
    if (opened === null || payloads[opened]) return;
    const controller = new AbortController();
    instance.get(`${base}/turns/${id}/events/${opened}/`, { signal:controller.signal, preserveAuthFailure:true }).then(({ data }) =>
      setPayloads((old) => ({ ...old, [opened]:data.payload }))).catch((e) => { if (!controller.signal.aborted) setError(errorText(e)); });
    return () => controller.abort();
  }, [id,opened,payloads]);
  return <section aria-label="Audit turn detail" className="space-y-5">
    <button className={buttonClass} onClick={close}>← Back to audit list</button>
    {error && <p role="alert" className="rounded-lg bg-red-50 p-4 text-red-800">{error}</p>}
    {!turn && !error && <p role="status">Loading turn…</p>}
    {turn && <>
      <div className="flex flex-wrap items-center gap-3"><h2 className="text-xl font-bold">Turn detail</h2><Status value={turn.status} /><span className="text-sm font-medium">{agentLabel(turn)}</span></div>
      <p className="break-all text-xs text-gray-500">Request {turn.request_id} · Conversation {turn.conversation_id}<br />{turn.user.username} (#{turn.user.id}) · Restaurant {turn.restaurant_id ?? "Global"} · Branch {turn.branch_id ?? "Global"} · {turn.model} · {time(turn.started_at)}</p>
      <Metrics turn={turn} />
      <section className="rounded-lg border bg-white p-4"><h3 className="mb-2 font-semibold">Original user prompt</h3><p className="whitespace-pre-wrap break-words">{turn.question?.content}</p></section>
      {turn.final_answer && <section className="rounded-lg border bg-white p-4"><h3 className="mb-2 font-semibold">Generated answer</h3><SafeMarkdown text={turn.final_answer.content} />
        {turn.final_answer.original_snapshot_unavailable && <p className="mt-2 text-xs text-amber-800">Stored legacy message; an immutable original answer snapshot was not recorded.</p>}
        <details className="mt-3"><summary className="cursor-pointer text-sm">Verified source references</summary><Json value={turn.final_answer.sources} /></details></section>}
      {turn.error_code && <p role="status" className="rounded-lg bg-red-50 p-4 text-sm text-red-800">{turn.failure_stage} · {turn.error_category} · {turn.error_code}</p>}
      <details><summary className="cursor-pointer text-sm font-medium">Stage durations and conversation totals</summary><Json value={{ stage_durations:turn.stage_durations, conversation_totals:turn.conversation_totals }} /></details>
      <h3 className="text-lg font-bold">Execution timeline</h3>
      <ol className="ml-2 space-y-4 border-l-2 border-gray-200 pl-5" aria-label="Execution timeline">
        {events.map((event) => <li key={event.sequence} className="rounded-lg border border-gray-200 bg-white p-4">
          <button className="flex w-full flex-wrap items-center gap-2 text-left" aria-expanded={opened === event.sequence} onClick={() => setOpened(opened === event.sequence ? null : event.sequence)}>
            <span className="font-mono text-xs text-gray-400">#{event.sequence}</span><strong className="text-sm">{event.event_type.replaceAll("_", " ")}</strong>
            <Status value={event.status} /><span className="ml-auto text-xs text-gray-500">{duration(event.duration_ms)}</span>
          </button>
          <p className="mt-2 break-all text-xs text-gray-500">{time(event.started_at)}{event.model_ordinal ? ` · Model ${event.model_ordinal}` : ""}{event.tool_name ? ` · ${event.tool_name}` : ""}{event.tool_call_id ? ` · ${event.tool_call_id}` : ""} · {number(event.payload_bytes)} bytes</p>
          {opened === event.sequence && (payloads[event.sequence] ? <EventPayload payload={payloads[event.sequence]} /> : <p className="mt-3 text-sm" role="status">Loading event payload…</p>)}
        </li>)}
      </ol>
      {next && <button className={buttonClass} onClick={() => setPage(page + 1)}>Load more events</button>}
    </>}
  </section>;
}

function LegacyMessages({ conversation, close, openTurn }) {
  const [data,setData] = useState(null); const [page,setPage] = useState(1); const [error,setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    instance.get(`${base}/conversations/${conversation.id}/messages/`, { params:{page}, signal:controller.signal, preserveAuthFailure:true }).then(({data:result}) => setData(result))
      .catch((e) => { if (!controller.signal.aborted) setError(errorText(e)); });
    return () => controller.abort();
  }, [conversation.id,page]);
  return <section className="space-y-4"><button className={buttonClass} onClick={close}>← Back to conversations</button>
    <h2 className="text-lg font-bold">Conversation messages · {agentLabel(conversation)}</h2>
    {data?.results?.some((message) => !message.trace_available) && <p className="text-sm text-gray-500">Some historical messages have no execution trace. Missing model/tool events are not reconstructed.</p>}
    {error && <p role="alert">{error}</p>}{data?.results.map((m) => <article className="rounded border bg-white p-4" key={m.id}>
      <p className="mb-2 text-xs font-bold uppercase">{m.role} · {m.trace_available ? "Trace recorded" : "Trace unavailable"}</p><SafeMarkdown text={m.content} />
      {m.trace_available && <button className={`${buttonClass} mt-3`} onClick={() => openTurn(m.request_id)}>View execution trace</button>}</article>)}
    {data && <Pages data={data} page={page} setPage={setPage} />}</section>;
}

export default function AIConversationAudit() {
  const [mode,setMode] = useState("turns"); const [filters,setFilters] = useState({}); const [applied,setApplied] = useState({});
  const [page,setPage] = useState(1); const [data,setData] = useState({results:[],count:0}); const [loading,setLoading] = useState(true);
  const [error,setError] = useState(""); const [selected,setSelected] = useState(null); const [legacy,setLegacy] = useState(null); const [refresh,setRefresh] = useState(0);
  const [options,setOptions] = useState({ agents: [{value:"operator_mentor",label:"Operator Mentor"},{value:"business_analyst",label:"Business Analyst"}],
    tools: ["search_documentation","fetch_documentation","retrieve_business_context"] });
  useEffect(() => {
    const controller = new AbortController();
    instance.get(`${base}/agents/`, {signal:controller.signal, preserveAuthFailure:true}).then(({data:result}) => {
      if (Array.isArray(result.agents) && Array.isArray(result.tools)) setOptions(result);
    }).catch(() => { /* Keep known choices; list/detail endpoints retain their own error state. */ });
    return () => controller.abort();
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    instance.get(`${base}/${mode}/`, {params:{...applied,page}, signal:controller.signal, preserveAuthFailure:true}).then(({data:result}) => { setData(result); setError(""); })
      .catch((e) => { if (!controller.signal.aborted) setError(errorText(e)); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [mode,applied,page,refresh]);
  function apply(event) { event.preventDefault(); setLoading(true); setPage(1); setApplied(Object.fromEntries(Object.entries(filters).filter(([,v]) => v))); }
  return <main className="ai-audit min-h-screen bg-gray-100 px-4 py-6 sm:px-6"><div className="mx-auto max-w-7xl space-y-5">
    <header className="flex flex-wrap items-center justify-between gap-3"><div><Link to="/super-admin" className="mb-2 inline-flex items-center gap-1 text-sm text-gray-600"><ArrowLeft size={14} />SuperAdmin</Link>
      <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900"><ClipboardList />AI Conversation Audit</h1><p className="mt-1 text-sm text-gray-500">Read-only execution records · Sensitive details are access logged · Cost unavailable</p></div>
      <button className={buttonClass} aria-label="Refresh audit list" onClick={() => {setLoading(true);setRefresh(refresh+1);}}><RefreshCw size={16} /></button></header>
    {selected ? <TurnDetail key={selected} id={selected} close={() => setSelected(null)} /> : legacy ? <LegacyMessages key={legacy.id} conversation={legacy} close={() => setLegacy(null)} openTurn={setSelected} /> : <>
      <nav className="flex gap-2" aria-label="Audit views">{[["turns","Audited turns"],["conversations","All conversations"]].map(([value,label]) => <button className={`${buttonClass} ${mode===value ? "ai-audit-active" : ""}`} key={value} onClick={() => {setMode(value);setPage(1);setLoading(true);}}>{label}</button>)}</nav>
      <form onSubmit={apply} className="grid grid-cols-2 gap-3 rounded-lg border bg-white p-4 md:grid-cols-4" aria-label="Audit filters">
        <label className="text-xs font-medium text-gray-600">Agent<select className={inputClass} value={filters.agent_type || ""} onChange={(e) => setFilters({...filters,agent_type:e.target.value})}>
          <option value="">All agents</option>{options.agents.map((agent) => <option key={agent.value} value={agent.value}>{agent.label}</option>)}
        </select></label>
        {[["start_date","From","date"],["end_date","To","date"],["user","User ID","number"],["restaurant","Restaurant ID","number"],["branch","Branch ID","number"],["conversation","Conversation ID","text"],["model","Model","text"],["error_code","Error code","text"],["error_category","Error category","text"]].map(([key,label,type]) => <label key={key} className="text-xs font-medium text-gray-600">{label}<input className={inputClass} type={type} value={filters[key] || ""} onChange={(e) => setFilters({...filters,[key]:e.target.value})} /></label>)}
        <label className="text-xs font-medium text-gray-600">Status<select className={inputClass} value={filters.status || ""} onChange={(e) => setFilters({...filters,status:e.target.value})}><option value="">All statuses</option>{["processing","completed","failed","interrupted"].map(s => <option key={s}>{s}</option>)}</select></label>
        <label className="text-xs font-medium text-gray-600">Tool<select className={inputClass} value={filters.tool || ""} onChange={(e) => setFilters({...filters,tool:e.target.value})}><option value="">All tools</option>{options.tools.map((tool) => <option key={tool}>{tool}</option>)}</select></label>
        <div className="flex items-end"><button className="ai-audit-primary w-full rounded-md px-4 py-2 text-sm font-semibold">Apply filters</button></div>
      </form>
      {error && <p role="alert" className="rounded border border-red-200 bg-red-50 p-4 text-red-800">{error}</p>}
      {loading ? <p role="status">Loading audits…</p> : !error && <div className="space-y-4 rounded-lg border bg-white p-4">
        {!data.results.length && <p className="py-8 text-center text-gray-500">No audit records match these filters.</p>}
        {data.results.map((item) => <button key={item.id} className="grid w-full gap-3 rounded-lg border border-gray-200 p-4 text-left hover:border-gray-400 md:grid-cols-[1fr_auto]" onClick={() => mode==="turns" ? setSelected(item.id) : setLegacy(item)}>
          <div className="min-w-0"><p className="mb-1 text-xs font-semibold text-indigo-700">{agentLabel(item)}</p><p className="break-words font-semibold text-gray-900">{item.question_preview || item.title || "Untitled conversation"}</p>
            <p className="mt-1 break-all text-xs text-gray-500">{item.user?.username || item.username} · {time(item.started_at || item.updated_at)}<br />Turn / record: {item.id}{item.conversation_id && <><br />Conversation: {item.conversation_id}</>}</p></div>
          {mode==="turns" ? <div className="text-xs leading-6 text-gray-600"><Status value={item.status} /><p>{item.model} · {item.model_calls} model / {item.tool_calls} tool calls</p><p>{duration(item.duration_ms)} · {number(item.usage?.total_tokens)} tokens</p></div>
            : <span className="text-sm text-gray-500">{item.audited_turns} audited turns · {item.trace_available ? "Traces available" : "Historical trace unavailable"}</span>}
        </button>)}
        <Pages data={data} page={page} setPage={(value) => {setLoading(true);setPage(value);}} />
      </div>}
    </>}
  </div></main>;
}
