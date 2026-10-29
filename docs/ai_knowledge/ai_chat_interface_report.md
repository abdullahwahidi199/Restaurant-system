# Task 6 — React chat integration

Implemented and checked on 2026-10-29. The chat is available at **`/assistant`** through one shared **Ask AI** staff workspace entry. It uses the existing Django assistant endpoints, staff authentication, active-restaurant guard and branch context. No backend, migration, business logic, proxy or model integration code was changed.

## Reference and conversion

The standalone reference is [ai_chat_interface.html](../../../ai_chat_interface.html), at `E:/pakhlai/ai_chat_interface.html`, one directory above the Git repository. The complete HTML, CSS and JavaScript were inspected. Its SHA-256 remains `8fc449b6c7e08fe850ed3b7257de9d8cb548c3a4209dcaa2ced44a8063030e7b`; the file was not copied over or modified.

The original has a full-height centered shell (900 px maximum), white bordered card, Inter/system typography, indigo accent/user bubbles, light assistant bubbles, 768/480 px breakpoints, welcome cards, copy button, textarea resizing, new-conversation action, thinking dots and blinking reveal cursor. It has **no sidebar** or genuine persisted history. Its local conversation ID is only an in-memory demo value.

The new implementation converts those elements into functional components, hooks, refs and scoped CSS. There is no iframe, full-template HTML injection or independent DOM application. Thinking remains a simple processing indicator. The original fake phase “Querying business data…” was not retained. Complete answers arrive through a normal HTTP response before reveal starts; no SSE, AI WebSocket, streaming response or direct provider request was added.

The full Markdown answer is stored unchanged. A memoized complete Markdown tree reveals only text leaves, preserving lists, tables, inline code and code blocks. Reveal is grapheme-aware, batched at 25 Hz, skippable and bypassed under reduced motion. Historical messages render immediately. Effects clean up timers/listeners and animation frames. A Strict Mode cleanup regression was caught by the long-history check and corrected. Scroll following uses small immediate frame-coalesced updates instead of competing queued smooth scrolls, and stops when reading above the newest messages.

Small deliberate visual/content changes:

- Pakhlai name/PK mark and documentation-only suggestions replace factory branding and financial demo requests.
- Back, language, logout and history controls use the existing Lucide dependency. They preserve the original compact icon/button treatment; Font Awesome/CDN assets are not required.
- A history drawer adds the backend's real list/history functionality without replacing the centered card.
- Actual source titles/headings appear beneath complete answers. No viewer endpoint exists, so there are no invented source links or internal paths.
- A small character-count/help row adds height to the composer and correspondingly reduces message space. Dynamic viewport height, RTL corners/text isolation and short-viewport adjustments support mobile use.
- The original connection-status pill becomes “Documentation guide”; no unverified online/provider-health claim is displayed.

The template's static factory charts, metric cards, financial answers and demo-mode notice are not enabled. This task explicitly excludes business analytics. Rename, delete, pin, conversation search and server-side cancellation are not implemented by the backend and have not been simulated.

## API, state and access

Inspected backend sources: `ai_assistant/urls.py`, `views.py`, `serializers.py`, `service.py`, `models.py`, `evidence.py`, `config.py`, `knowledge/access.py` and `backend/urls.py`. Connected existing endpoints:

| Endpoint | Frontend behavior |
|---|---|
| `POST /api/assistant/chat/` | `{message, conversation_id?}`; stores returned conversation UUID, request UUID and complete `message` |
| `GET /api/assistant/conversations/?page=N` | Real scoped list, 20/page; compact history drawer |
| `GET /api/assistant/conversations/{uuid}/messages/?page=N` | Oldest-first history, 40/page; append pages before continuing |

The existing API base remains configurable through the staff client. JWT refresh, Authorization and branch headers are reused. Chat supplies `Accept-Language`. A synchronous lock guards double-click/Enter submission; generation checks and abort signals prevent an old response/history load from being applied after conversation switching. Account/session/role/restaurant/branch/known-permission context changes remount and clear the local session. The real application route was tested through a language change and retained its conversation ID.

The frontend recognizes the backend's ten known restaurant staff login roles. Customers and unknown custom roles do not receive the entry. The separate SuperAdmin portal does not receive a new chat policy; actual backend superuser access remains unchanged. Django still checks active staff, subscription, authorized active branch, ownership, current permission binding and source access. Navigation visibility does not grant an operation.

HTTP failures use bounded localized categories rather than provider/error bodies. Expiration, permission/404, busy/context changes, rate limits, missing configuration/index, provider failure, malformed response, network failure and native XHR timeout were checked. Questions stay visible and are restored to the composer. Uncertain POSTs are not automatically retried. The existing known-401 token refresh retry remains intact.

Two small shared frontend integration options were added, both defaulting to existing behavior elsewhere:

1. `RequireAuth.showPortalLogout=false` on this route: the chat supplies the existing logout action in its own header, keeping a floating logout button off the composer.
2. Staff Axios `preserveAuthFailure=true` on assistant requests: failed refresh removes stored credentials as before, but leaves the question on screen with an explicit sign-in link. This avoids losing it through an immediate full-page redirect. It does not skip backend authentication or persist a private draft for another account.

No backend schema, tools, endpoints or response fields were invented. Source display accepts actual verified metadata; unexpected path/URL fields are discarded. Raw HTML, JavaScript/data/file/relative URLs and remote images cannot become executable content. The production entry contains no mock credential or DeepSeek key. Synthetic staff credentials exist only in the development test fixture.

## Verification

| Check | Actual result |
|---|---|
| `npm.cmd test` | 44/44 unit tests passed, including Unicode/link/context helpers and the staff-route assertion |
| `npm.cmd run check:ai-conversion` | Passed; original vs React desktop card width/background/radius match; reveal/skip/Markdown and mobile en/fa/ps checked |
| `npm.cmd run test:ai` | 31/31 browser scenarios passed; Node reports 32/32 including the enclosing test, zero skips |
| Focused ESLint: new AI module and fixture | Passed |
| Node syntax checks: three browser scripts | Passed |
| Production Vite build | Passed; the existing application still emits its large-chunk warning |
| Django `manage.py test ai_assistant.tests.test_api --verbosity 1` | 18/18 passed in an isolated test database, without a real provider key |
| Dependency lock review | Two direct runtime additions; no existing package version changed |
| Reference hash and `git diff --check` | Reference unchanged; whitespace checks passed |

The browser suite uses actual React under Strict Mode, real Axios/XHR and mocked HTTP responses. It covers immediate question display; thinking until response completion; fresh/follow-up requests; source display; paged list/history; late response/history isolation; short/long/Unicode/RTL answers; original-text copy; skip/reduced motion; unmount cleanup; Enter/Shift+Enter/IME; limits; Markdown injection/unsafe links/images; error/privacy boundaries; successful/failed refresh; accelerated native client timeout with the actual 150,000 ms setting; mismatched conversation IDs; stale sources; role/branch changes; every eligible navigation role; logout; real App routing/language changes; long-history scrolling; and a shortened mobile viewport.

Screenshots were captured under ignored `artifacts/ai-chat/`, including the reference, converted desktop, messages, mobile English/Dari/Pashto and actual App route. Desktop and mobile screenshots were visually inspected. Main tested viewports were 1280×900, 768×1024, 390×844 and 390×430. No uncaught browser errors or unexpected API requests are accepted by the suite. These are local mocked UI tests, not live DeepSeek responses or a browser-to-production integration run.

## Files and reproduction

New production files are under [frontend/src/modules/ai](../../frontend/src/modules/ai/README.md): `AIChatPage`, `AIChatEntry`, `ChatWorkspace`, `access`, `text`, `useAIChat`, `aiChatApi`, seven focused message/composer/history/animation/Markdown components, reveal context and scoped styles. Localization files are `frontend/src/locals/ai/{en,fa,ps}.json`. New tests/checks are `text.test.js`, `frontend/tests/ai-chat.html`, `frontend/tests/ai-chat-harness.jsx`, and `frontend/scripts/{ai-chat-browser.mjs,ai-chat.test.mjs,check-ai-conversion.mjs}`.

Modified integration files: `frontend/src/App.jsx`, `rootLayout.jsx`, `api/ReauireAuth.jsx`, `api/axiosInstance.jsx`, `config/staffRoutes.js`, `config/staffRoutes.test.js`, `i18n.js`, `seo/seoConfig.js`, `frontend/package.json` and `package-lock.json`. The unrelated generated sitemap date change from the normal prebuild was reverted. Runtime additions are `react-markdown` and `remark-gfm`, justified by safe React Markdown and table support; existing packages were not upgraded.

Reproduction commands, API shapes, state/error recovery, timeout budgets and code responsibilities are in the [developer guide](../../frontend/src/modules/ai/README.md). Browser checks launch their own local Vite server and isolated Chrome profile; no separate running backend is required. `CHROME_PATH` can override the Windows Chrome path.

## Remaining verification

- No live DeepSeek call was made, no real API key was needed and no real operator/customer data was used. Real model answer quality, tool selection and multilingual fluency remain subject to the previous evaluation limitations.
- The normal authenticated browser-to-Django deployment still needs an authorized development-account acceptance run with its actual API origin, branch/subscription setup, built documentation index and configured provider. The mocked frontend tests and separate Django API tests do not claim that live deployment check.
- The 150-second client budget covers default backend settings. Increased configured turn limits and real proxy timeouts need deployment review. No repository Nginx configuration was found; none was modified.
- Physical devices/mobile keyboards, other browser engines, assistive technologies and fluent human Dari/Pashto review were not exercised. Responsive/Unicode/RTL behavior was verified in headless Chrome at the listed sizes.
- The backend has no idempotency key or cancel endpoint. Aborting a client request does not cancel server work; review saved history before manually resending. The shared assistant throttle also applies to list/history requests.
- Source references have no public authorized viewer, so they remain text. No unsupported rename/delete/pin/search controls or live-data tools are presented.

No streaming, charts, business-data tools, embeddings or architecture replacement were added.
