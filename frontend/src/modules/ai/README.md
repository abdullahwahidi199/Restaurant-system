# Pakhlai operator chat

Open **Ask AI** from the shared staff workspace shortcut, or visit `/assistant` after signing in and selecting an active branch. The route uses the existing `RequireAuth`, `RequireActiveRestaurant`, `AuthContext`, staff API client and domain guard. Django remains authoritative for eligibility, branch/subscription scope, ownership and document access.

The unchanged design reference is `E:/pakhlai/ai_chat_interface.html`, at this workspace's root, one directory above the Git repository. Its centered card, indigo palette, spacing, message bubbles, composer, thinking dots and cursor were converted to native React. The original has no sidebar; the integrated history drawer uses the existing list endpoint.

## Structure

| File | Responsibility |
|---|---|
| `AIChatPage.jsx` | Active-branch prerequisite; remount session on account/session/role/branch/known-permission changes; existing logout |
| `AIChatEntry.jsx`, `access.js` | One shared staff shortcut; known eligible restaurant roles; context identity |
| `ChatWorkspace.jsx` | Original shell/card, welcome suggestions, language switch, history controls and scroll following |
| `hooks/useAIChat.js` | Conversation state, synchronous submission lock, request cancellation/generation checks, paged history and recovery |
| `services/aiChatApi.js` | Authenticated HTTP, actual response schema, safe display metadata and bounded error categories |
| `components/ChatComposer.jsx` | Auto-resize, Enter/Shift+Enter/IME, Unicode codepoint limit |
| `components/ChatMessage.jsx` | User/assistant bubbles, original full-text copy, historical state |
| `components/ThinkingAnimation.jsx` | Original pulsing processing indicator, without simulated tool activity |
| `components/TypewriterText.jsx` | Batched grapheme reveal after complete HTTP response, skip/reduced-motion/cleanup |
| `components/SafeMarkdown.jsx`, `revealContext.js` | Complete Markdown parsed once per text, text-leaf reveal, safe links, no raw HTML or remote images |
| `components/MessageSources.jsx` | Compact text-only verified title/heading references |
| `components/ConversationHistory.jsx` | Accessible drawer with focus trapping, Escape/backdrop close and pagination |
| `text.js`, `styles/ai-chat.css` | Shared Unicode/link helpers; original CSS scoped under `.pakhlai-ai` plus small integration rules |

## Existing HTTP contract

All paths below are relative to the existing staff client's API base (normally `/api`). No frontend request goes to a model provider.

| Request | Payload/result |
|---|---|
| `POST /assistant/chat/` | `{message, conversation_id?}` → `{conversation_id, request_id, message}`; first POST creates the conversation |
| `GET /assistant/conversations/?page=0` | `{results: [{id, title, created_at, updated_at}], next_page}`; 20 per page |
| `GET /assistant/conversations/{uuid}/messages/?page=0` | `{conversation_id, results, next_page}`; 40 per page, oldest first |

A message contains `id`, `role`, `content`, `kind`, `state`, `sources`, `stale_sources`, `created_at` and optional error metadata. The UI keeps only needed display fields. Sources use actual `document_title`, `heading`, document/section IDs and verified status; filesystem paths, arbitrary URLs, discovery tokens and provider diagnostics are not rendered. There is no authorized documentation-view endpoint, so sources are not links.

Conversation IDs come from Django. **New conversation** resets the local workspace; it does not delete a saved conversation or cancel server processing. No rename/delete/pin/search-conversation APIs exist, so those controls are absent. Lists refresh when opened or when starting a new conversation, rather than spending the shared backend throttle on a GET after every reply.

## Interaction and limits

The full assistant message is stored before reveal begins. The thinking indicator exists only while the POST is pending. The text leaf reveal keeps Markdown structure intact, updates at 25 Hz, supports grapheme clusters and takes at most about 20 seconds for supported long answers. **Show full answer** skips it. Reduced motion shows full text immediately; history never replays reveal/entrance animations. Copy uses the stored original Markdown, not the visible prefix. Timers, media listeners, focus handlers, animation frames and requests are cleaned up.

Scroll updates are coalesced with animation frames. Sending follows the newest turn; scrolling away pauses following. The original queued smooth scroll is replaced with immediate, small follow updates so it cannot fight a reader during reveal. The card still uses the original 768/480 px breakpoints, with dynamic viewport height and small RTL/mobile additions.

The composer counts Unicode codepoints like Django and applies the default **4,000-character** limit. The backend's configured limit remains authoritative, including a smaller deployment-specific limit. New turns are blocked during pending requests, reveal, failed history loads or incomplete paged history. Read all pages before continuing an older conversation. Historical pending/failed states are displayed; Django arbitrates an active turn with its existing 409 response.

Chat POST timeout is **150,000 ms**; list/history timeout is 20,000 ms. This covers Django's default 90-second turn and a provider operation near its deadline. A deployment that increases backend time budgets must review this client budget and its ordinary HTTP proxy timeout. No accessible Nginx configuration was found or changed.

Failures preserve the question in the current view, stop thinking and show localized, allowlisted messages. No uncertain POST is automatically retried. The shared client's existing refresh/retry of a rejected **401** is preserved. Chat opts into `preserveAuthFailure`: failed refresh still removes credentials, but keeps the question visible and offers explicit sign-in instead of immediately navigating away. Other pages retain their existing redirect behavior. Questions are not persisted in browser storage across sign-in/account changes. Before resending, reload history: the server may have completed a request even after a timeout or client cancellation. There is no backend idempotency-key or cancellation contract.

The frontend entry mirrors `knowledge.access.LOGIN_ROLES`: Admin, BranchAdmin, Manager, Cashier, Waiter, Kitchen_manager, InventoryManager, FinanceManager, OperationsManager and Call_operator. It does not infer access for custom role names, customer accounts or the separate SuperAdmin portal. Backend superuser API access still exists; this task does not add a platform-superuser chat navigation policy.

English, Dari and Pashto labels use existing i18next resources under `src/locals/ai/`. Answers keep the backend's original language and actual English control labels. Localized UI does not improve the underlying multilingual retrieval limits described in the Task 5 report.

## Validation

From `frontend`:

```powershell
npm.cmd test
npm.cmd run check:ai-conversion
npm.cmd run test:ai
npm.cmd run build
```

The browser scripts use Node's built-in runner and the repository's existing Chrome/CDP testing approach. They start an isolated loopback Vite server with `VITE_API_URL=/api`, use a separate headless Chrome profile and mock API requests. No production mock mode, new test framework or model key is required. Chrome defaults to `C:/Program Files/Google/Chrome/Application/chrome.exe`; override `CHROME_PATH` if necessary. Node 24 was used. `AI_CHAT_TEST_URL` can select an already-running, trusted test Vite server configured with the same local API base.

`tests/ai-chat.html` and `tests/ai-chat-harness.jsx` are isolated development fixtures, outside the production entry. Browser HTTP interception blocks third-party requests during integration tests. Screenshots and safe browser diagnostics are written under ignored `artifacts/ai-chat/`. The conversion checker compares the original card's geometry, color and radius and captures desktop/mobile views. See the [Task 6 report](../../../../docs/ai_knowledge/ai_chat_interface_report.md) for actual results and remaining verification.

Only two runtime dependencies were added: [react-markdown](https://github.com/remarkjs/react-markdown) for React Markdown rendering and [remark-gfm](https://github.com/remarkjs/remark-gfm) for tables/lists. No raw-HTML plugin is enabled. No existing dependency version was upgraded.
