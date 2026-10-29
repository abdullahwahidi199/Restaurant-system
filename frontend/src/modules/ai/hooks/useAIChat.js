import { useCallback, useEffect, useRef, useState } from "react";
import { aiChatApi, errorCategory, isConversationId } from "../services/aiChatApi";
import { characterCount, INPUT_LIMIT } from "../text";
import useModelSelection from "./useModelSelection";

const unique = (items) => [...new Map(items.map((item) => [item.id, item])).values()];
const initialView = () => ({ conversationId: null, title: "", messages: [], draft: "", error: null, failedQuestion: "", sending: false,
  loading: false, animatingId: null, historyNext: null, historyIncomplete: false });

export default function useAIChat(language, preferenceOwner) {
  const selection = useModelSelection(preferenceOwner);
  const getModelConfiguration = selection.getModelConfiguration;
  const [view, setView] = useState(initialView);
  const [list, setList] = useState({ conversations: [], listNext: null, listLoading: false, listError: null });
  const current = useRef(view);
  current.current = view;
  const epoch = useRef(0);
  const lock = useRef(false);
  const requests = useRef(new Set());
  const listRequest = useRef(null);
  const alive = useRef(true);
  const draftRef = useRef("");
  const makeRequest = useCallback(() => {
    const controller = new AbortController(); requests.current.add(controller); return controller;
  }, []);
  const changeView = useCallback(() => {
    epoch.current += 1;
    for (const controller of requests.current) controller.abort();
    requests.current.clear();
    lock.current = false;
  }, []);
  useEffect(() => {
    alive.current = true;
    return () => { alive.current = false; changeView(); listRequest.current?.abort(); };
  }, [changeView]);

  const loadConversations = useCallback(async (page = 0) => {
    listRequest.current?.abort();
    const controller = new AbortController(); listRequest.current = controller;
    setList((state) => ({ ...state, listLoading: true, listError: null }));
    try {
      const result = await aiChatApi.conversations(page, controller.signal);
      if (!alive.current || controller.signal.aborted) return;
      setList((state) => ({ conversations: unique(page ? [...state.conversations, ...result.results] : result.results), listNext: result.nextPage, listLoading: false, listError: null }));
    } catch (error) {
      if (alive.current && !controller.signal.aborted) setList((state) => ({ ...state, listLoading: false, listError: errorCategory(error) }));
    }
  }, []);
  useEffect(() => { loadConversations(); }, [loadConversations]);

  const setDraft = useCallback((draft) => {
    draftRef.current = draft;
    setView((state) => ({ ...state, draft }));
  }, []);
  const startNew = useCallback(() => {
    changeView(); draftRef.current = ""; setView(initialView());
    loadConversations();
  }, [changeView, loadConversations]);

  const readHistory = useCallback(async (id, page, reset = false) => {
    if (lock.current) return;
    const stamp = epoch.current;
    const controller = makeRequest(); lock.current = true;
    setView((state) => ({ ...state, loading: true, error: null }));
    try {
      const result = await aiChatApi.messages(id, page, controller.signal);
      if (!alive.current || stamp !== epoch.current || controller.signal.aborted) return;
      setView((state) => ({ ...state, messages: unique([...(reset ? [] : state.messages), ...result.results.map((item) => ({ ...item, historical: true }))]),
        historyNext: result.nextPage, historyIncomplete: false, loading: false, error: null, failedQuestion: "" }));
    } catch (error) {
      if (alive.current && stamp === epoch.current && !controller.signal.aborted) setView((state) => ({ ...state, loading: false, error: errorCategory(error), historyIncomplete: true }));
    } finally {
      requests.current.delete(controller);
      if (stamp === epoch.current) lock.current = false;
    }
  }, [makeRequest]);

  const openConversation = useCallback((id) => {
    if (!isConversationId(id)) return;
    changeView(); draftRef.current = "";
    setView({ ...initialView(), conversationId: id, title: list.conversations.find((item) => item.id === id)?.title || "", loading: true });
    readHistory(id, 0, true);
  }, [changeView, list.conversations, readHistory]);
  const reloadConversation = useCallback(() => {
    const state = current.current;
    if (state.conversationId && !lock.current) readHistory(state.conversationId, 0, true);
  }, [readHistory]);
  const loadMoreMessages = useCallback(() => {
    const state = current.current;
    if (state.conversationId && state.historyNext !== null) readHistory(state.conversationId, state.historyNext);
  }, [readHistory]);
  const finishAnimation = useCallback(() => setView((state) => ({ ...state, animatingId: null })), []);

  const send = useCallback(async () => {
    const state = current.current;
    const configuration = getModelConfiguration(); // Snapshot this turn before any async work.
    const question = draftRef.current.trim();
    if (lock.current || state.animatingId || state.historyNext !== null || state.historyIncomplete || !question) return;
    if (characterCount(question) > INPUT_LIMIT) { setView((value) => ({ ...value, error: "validation" })); return; }
    lock.current = true; // synchronous guard protects click+Enter before React commits
    const stamp = epoch.current;
    const controller = makeRequest();
    if (state.failedQuestion === question && state.conversationId) {
      // A timed-out POST can have completed on Django. Reconcile persisted
      // history before sending it again; a genuine failed turn may be retried.
      try {
        const saved = [];
        let page = 0;
        do {
          const history = await aiChatApi.messages(state.conversationId, page, controller.signal);
          saved.push(...history.results);
          page = history.nextPage;
        } while (page !== null);
        if (!alive.current || stamp !== epoch.current || controller.signal.aborted) return;
        const lastUser = saved.findLastIndex((item) => item.role === "user");
        const completed = saved[lastUser]?.content === question && saved[lastUser]?.state === "complete"
          && saved.slice(lastUser + 1).some((item) => item.role === "assistant" && !state.messages.some((prior) => prior.id === item.id));
        setView((value) => ({ ...value, messages: saved.map((item) => ({ ...item, historical: true })), historyNext: null, historyIncomplete: false }));
        if (completed) {
          draftRef.current = "";
          setView((value) => ({ ...value, draft: "", error: null, failedQuestion: "" }));
          requests.current.delete(controller); lock.current = false;
          return;
        }
      } catch (error) {
        if (alive.current && stamp === epoch.current && !controller.signal.aborted) {
          setView((value) => ({ ...value, error: errorCategory(error), historyIncomplete: true }));
        }
        requests.current.delete(controller);
        if (stamp === epoch.current) lock.current = false;
        return;
      }
    }
    const localId = `local-${crypto.randomUUID()}`;
    draftRef.current = "";
    setView((value) => ({ ...value, draft: "", error: null, failedQuestion: "", sending: true, title: value.title || Array.from(question).slice(0, 100).join(""),
      messages: [...value.messages, { id: localId, role: "user", content: question, state: "pending", created_at: new Date().toISOString(), sources: [] }] }));
    try {
      const response = await aiChatApi.send(question, state.conversationId, language, controller.signal, configuration);
      if (!alive.current || stamp !== epoch.current || controller.signal.aborted) return;
      setView((value) => ({ ...value, conversationId: response.conversationId, sending: false, animatingId: response.message.id,
        messages: [...value.messages.map((item) => item.id === localId ? { ...item, state: "complete" } : item), response.message] }));
      // Refresh only on demand/new conversation to avoid exhausting the shared
      // backend 10/min read+write throttle with an extra GET after every reply.
    } catch (error) {
      if (!alive.current || stamp !== epoch.current || controller.signal.aborted) return;
      const returnedId = error.response?.data?.conversation_id;
      draftRef.current = question;
      setView((value) => ({ ...value, conversationId: value.conversationId || (isConversationId(returnedId) ? returnedId : null),
        draft: question, sending: false, failedQuestion: question, error: errorCategory(error),
        messages: value.messages.map((item) => item.id === localId ? { ...item, state: "failed" } : item) }));
    } finally {
      requests.current.delete(controller);
      if (stamp === epoch.current) lock.current = false;
    }
  }, [language, makeRequest, getModelConfiguration]);
  return { ...view, ...list, selection, setDraft, startNew, send, loadConversations, openConversation, reloadConversation, loadMoreMessages, finishAnimation };
}
