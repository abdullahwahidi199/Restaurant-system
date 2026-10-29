import assert from "node:assert/strict";
import { test } from "node:test";
import { browserSession, click, site } from "./ai-chat-browser.mjs";

const id="aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const turn={id,request_id:id,conversation_id:id,user:{id:1,username:"Synthetic operator"},status:"completed",model:"synthetic-model",
  question_preview:"Synthetic invoice question",question:{content:"Original synthetic question"},started_at:"2026-10-29T08:00:00Z",duration_ms:2500,
  model_calls:4,completed_model_calls:4,tool_calls:3,completed_tool_calls:3,usage:{prompt_tokens:120,completion_tokens:30,total_tokens:150},usage_complete:true,
  final_answer:{content:"Use **Create Invoice**.",sources:[]},stage_durations:{provider_duration_ms:2000},conversation_totals:{turns:2}};
const events=[{sequence:1,event_type:"user_message",status:"completed"},{sequence:2,event_type:"model_request",status:"started",model_ordinal:1},
  {sequence:3,event_type:"tool_result",tool_name:"search_documentation",status:"ok",model_ordinal:1},{sequence:4,event_type:"tool_result",tool_name:"fetch_documentation",status:"ok",model_ordinal:2}]
  .map(e=>({...e,id:e.sequence,started_at:turn.started_at,duration_ms:12,payload_bytes:300}));
const paged=(results,next=null,previous=null)=>({results,count:results.length,next,previous});

test("SuperAdmin AI audit interface — mocked HTTP, zero provider calls",{timeout:120000},async t=>{
  const browser=await browserSession();const requests=[];let deny=false;let failed=false;
  browser.on("Fetch.requestPaused",async event=>{
    const url=new URL(event.request.url);
    if(url.origin!==site){await browser.send("Fetch.failRequest",{requestId:event.requestId,errorReason:"BlockedByClient"});return;}
    if(!url.pathname.startsWith("/api/")){await browser.send("Fetch.continueRequest",{requestId:event.requestId});return;}
    requests.push({path:url.pathname,query:Object.fromEntries(url.searchParams),method:event.request.method});
    let data;
    if(deny){await browser.fulfill(event.requestId,{detail:"Not authorized"},403);return;}
    if(failed){await browser.fulfill(event.requestId,{error:{code:"audit_unavailable"}},503);return;}
    const path=url.pathname;
    if(path.endsWith('/turns/'))data=paged([{...turn,id:url.searchParams.get('page')==='2'?'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb':id}],url.searchParams.get('page')==='2'?null:'?page=2',url.searchParams.get('page')==='2'?'?page=1':null);
    else if(path.endsWith(`/turns/${id}/`))data=turn;
    else if(path.endsWith('/events/'))data=paged(events);
    else if(path.endsWith('/events/2/'))data={payload:{capture_boundary:"deepseek_http",payload:{model:"synthetic-model",messages:[{role:"system",content:"ACTUAL_ORDER_FIRST"},{role:"user",content:"ACTUAL_ORDER_SECOND"}],tools:[{type:"function"}],max_tokens:1800}}};
    else if(path.endsWith('/events/3/'))data={payload:{result:{ranking_method:"keyword rank",results:[{rank:1,document_id:"guide",section_id:"create",module:"contractors",relevance_score:12.5}]}}};
    else if(path.endsWith('/events/4/'))data={payload:{result:{sections:[{heading:"Create invoice",document_id:"guide",section_id:"create",content:"Use **Create Invoice**.\n\n<script>window.auditXss=true</script>\n\n![x](https://tracking.invalid/image)",is_partial:false}]}}};
    else if(path.endsWith('/conversations/'))data=paged([{id,title:"Legacy conversation",username:"Synthetic operator",audited_turns:0,trace_available:false,updated_at:turn.started_at}]);
    else if(path.endsWith('/messages/'))data={...paged([{id:1,role:"user",content:"Historical question",trace_available:false}]),conversation_totals:{turns:0}};
    else data={payload:{content:"Synthetic observable output"}};
    await browser.fulfill(event.requestId,data);
  });
  await browser.send("Fetch.enable",{patterns:[{urlPattern:"*",requestStage:"Request"}]});
  async function reset(query=''){requests.length=0;await browser.navigate('/tests/ai-audit.html'+query);await browser.waitFor("document.querySelector('h1')?.textContent.includes('AI Conversation Audit') || document.body.textContent.includes('Sign in required')");}
  async function open(){await browser.waitFor("Boolean(document.querySelector('main button.grid'))");await click(browser,'main button.grid');await browser.waitFor("Boolean(document.querySelector('[aria-label=\"Execution timeline\"]'))");}
  try{
    await t.test("filters and pagination use server-side GET requests",async()=>{
      await reset();await browser.waitFor("Boolean(document.querySelector('main button.grid'))");
      await browser.evaluate("(()=>{const el=document.querySelector('input[type=number]');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(el,'42');el.dispatchEvent(new Event('input',{bubbles:true}));})()");
      await browser.evaluate("document.querySelector('form').requestSubmit()");
      await browser.waitFor("Boolean(document.querySelector('main button.grid'))");
      await browser.waitFor("!document.body.textContent.includes('Loading audits')");
      await browser.evaluate("Array.from(document.querySelectorAll('button')).find(b=>b.textContent==='Next').click()");
      await browser.waitFor("document.body.textContent.includes('Page 2') && !document.body.textContent.includes('Loading audits')");
      assert.ok(requests.some(r=>r.query.user==='42'&&r.query.page==='2'));
      assert.ok(requests.every(r=>r.method==='GET'));
    });
    await t.test("detail preserves real event order and expands ordered model context",async()=>{
      await reset();await open();
      assert.deepEqual(await browser.evaluate("Array.from(document.querySelectorAll('[aria-label=\"Execution timeline\"] > li button strong'),e=>e.textContent)"),['user message','model request','tool result','tool result']);
      await browser.evaluate("document.querySelectorAll('[aria-label=\"Execution timeline\"] > li button')[1].click()");
      await browser.waitFor("document.body.textContent.includes('ACTUAL_ORDER_SECOND')");
      assert.ok(await browser.evaluate("document.body.textContent.indexOf('ACTUAL_ORDER_FIRST')<document.body.textContent.indexOf('ACTUAL_ORDER_SECOND')"));
      assert.equal(await browser.evaluate("document.body.textContent.includes('Original synthetic question')"),true);
    });
    await t.test("ranked results and historical Markdown render safely",async()=>{
      await browser.evaluate("document.querySelectorAll('[aria-label=\"Execution timeline\"] > li button')[2].click()");
      await browser.waitFor("Boolean(document.querySelector('table'))");
      assert.equal(await browser.evaluate("document.querySelector('table').textContent.includes('12.5000')"),true);
      await browser.evaluate("document.querySelectorAll('[aria-label=\"Execution timeline\"] > li button')[3].click()");
      await browser.waitFor("document.body.textContent.includes('Complete evidence')");
      await browser.evaluate("document.querySelector('[data-testid=\"audit-event-payload\"] details').open=true");
      assert.equal(await browser.evaluate("Boolean(window.auditXss)"),false);
      assert.equal(await browser.evaluate("document.querySelectorAll('[data-testid=\"audit-event-payload\"] img,[data-testid=\"audit-event-payload\"] script').length"),0);
    });
    await t.test("desktop and mobile keep the timeline and payloads readable",async()=>{
      await browser.viewport(390,844);
      assert.equal(await browser.evaluate("document.documentElement.scrollWidth<=innerWidth"),true);
      await browser.screenshot('audit-mobile');await browser.viewport(1440,1000);await browser.screenshot('audit-desktop');
    });
    await t.test("legacy messages explicitly disclose missing historical traces",async()=>{
      await reset();await browser.evaluate("Array.from(document.querySelectorAll('nav button')).find(b=>b.textContent==='All conversations').click()");
      await browser.waitFor("document.body.textContent.includes('Historical trace unavailable')");await click(browser,'main button.grid');
      await browser.waitFor("document.body.textContent.includes('Historical question')");
      assert.equal(await browser.evaluate("document.body.textContent.includes('Trace unavailable')"),true);
    });
    await t.test("backend denials and unavailable storage display safe errors",async()=>{
      deny=true;await reset();await browser.waitFor("Boolean(document.querySelector('[role=alert]'))");
      assert.equal(await browser.evaluate("document.body.textContent.includes('SuperAdmin authorization is required')"),true);
      deny=false;failed=true;await reset();await browser.waitFor("Boolean(document.querySelector('[role=alert]'))");
      assert.equal(await browser.evaluate("document.body.textContent.includes('Audit data could not be loaded')"),true);failed=false;
    });
    await t.test("ordinary role cannot mount the audit view or issue audit queries",async()=>{
      await reset('?role=Admin');await browser.waitFor("document.body.textContent.includes('Sign in required')");assert.equal(requests.length,0);
    });
    assert.deepEqual(browser.errors,[]);
  }finally{await browser.close();}
});
