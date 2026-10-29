import { useCallback, useEffect, useRef, useState } from "react";
import { aiChatApi } from "../services/aiChatApi";
import { modelPreferenceKey, resolveModelPreference, validModelPreference } from "../modelPreferences";

export default function useModelSelection(owner) {
  const [state, setState] = useState({ modelOptions: null, modelConfiguration: null, optionsLoading: true, optionsError: false });
  const current = useRef(state);
  const key = modelPreferenceKey(owner);
  useEffect(() => {
    const controller = new AbortController();
    const pending = { modelOptions: null, modelConfiguration: null, optionsLoading: true, optionsError: false };
    current.current = pending;
    // ChatSession is remounted whenever account/scope changes. Abort also guards
    // StrictMode and prevents a prior account's options from arriving late.
    aiChatApi.modelOptions(controller.signal).then((options) => {
      if (controller.signal.aborted) return;
      let saved;
      try { saved = key ? JSON.parse(localStorage.getItem(key) || "null") : null; } catch { saved = null; }
      const next = { modelOptions: options, modelConfiguration: resolveModelPreference(options, saved), optionsLoading: false, optionsError: false };
      current.current = next; setState(next);
    }).catch(() => {
      if (controller.signal.aborted) return;
      const next = { modelOptions: null, modelConfiguration: null, optionsLoading: false, optionsError: true };
      current.current = next; setState(next);
    });
    return () => controller.abort();
  }, [key]);

  const change = useCallback((field, value) => {
    const previous = current.current;
    if (!previous.modelOptions || !previous.modelConfiguration) return;
    const configuration = { ...previous.modelConfiguration, [field]: value };
    if (!validModelPreference(previous.modelOptions, configuration)) return;
    const next = { ...previous, modelConfiguration: configuration };
    current.current = next; setState(next);
    try { if (key) localStorage.setItem(key, JSON.stringify(configuration)); } catch { /* Private/storage-disabled browsers keep session state. */ }
  }, [key]);
  const setModel = useCallback((value) => change("model", value), [change]);
  const setReasoningEffort = useCallback((value) => change("reasoning_effort", value), [change]);
  const getModelConfiguration = useCallback(() => {
    const configuration = current.current.modelConfiguration;
    return configuration ? { ...configuration } : null;
  }, []);
  return { ...state, setModel, setReasoningEffort, getModelConfiguration };
}
