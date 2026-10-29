// The authenticated backend defines supported values. Store only per-account UI
// preferences; no tokens, reasoning, conversation content or global defaults.
export function modelPreferenceKey(owner) {
  return owner ? `pakhlai.ai.model.${owner}` : null;
}

export function validModelPreference(options, preference) {
  return !!preference && options.models.some((option) => option.value === preference.model)
    && options.reasoning_efforts.some((option) => option.value === preference.reasoning_effort);
}

export function resolveModelPreference(options, preference) {
  const selected = validModelPreference(options, preference) ? preference : options.defaults;
  return { model: selected.model, reasoning_effort: selected.reasoning_effort };
}
