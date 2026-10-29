import assert from "node:assert/strict";
import { test } from "node:test";
import { modelPreferenceKey, resolveModelPreference, validModelPreference } from "./modelPreferences.js";

const options = { models: [{value:"deepseek-flash"},{value:"deepseek-v4-pro"}], reasoning_efforts: [{value:"none"},{value:"low"},{value:"high"},{value:"max"}],
  defaults: {model:"deepseek-v4-pro",reasoning_effort:"none"} };

test("model preference defaults come from the backend and obsolete selections fall back",()=>{
  for(const saved of [null,{}, {model:"retired",reasoning_effort:"none"},{model:"deepseek-flash",reasoning_effort:"ultra"}]) {
    assert.deepEqual(resolveModelPreference(options,saved),options.defaults);
  }
});
test("both models and four efforts are remembered without saving unrelated data",()=>{
  for(const model of options.models) for(const effort of options.reasoning_efforts) {
    const saved={model:model.value,reasoning_effort:effort.value};
    assert.equal(validModelPreference(options,saved),true);
    assert.deepEqual(resolveModelPreference(options,{...saved,credential:"must not copy"}),saved);
  }
});
test("different accounts use independent storage keys and anonymous sessions do not persist",()=>{
  assert.notEqual(modelPreferenceKey("1.1"),modelPreferenceKey("1.2"));
  assert.notEqual(modelPreferenceKey("1.1"),modelPreferenceKey("2.1"));
  assert.equal(modelPreferenceKey(null),null);
});
