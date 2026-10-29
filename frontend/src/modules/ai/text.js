// Shared by validation and reveal: never split surrogate pairs or combining marks.
const segmenter = typeof Intl.Segmenter === "function"
  ? new Intl.Segmenter(undefined, { granularity: "grapheme" }) : null;

export function segmentText(text) {
  return segmenter ? Array.from(segmenter.segment(text), (entry) => entry.segment) : Array.from(text);
}

export const INPUT_LIMIT = 4000; // Django's default AI_INPUT_CHARACTERS; server remains authoritative.
export const characterCount = (text) => Array.from(text).length;

export function safeAnswerUrl(url) {
  // Relative Markdown source paths have no authorized public viewer. No invented links.
  if (typeof url !== "string" || !/^(https?:\/\/|mailto:)/i.test(url)) return undefined;
  try {
    const parsed = new URL(url);
    if (parsed.username || parsed.password) return undefined;
    return url;
  } catch { return undefined; }
}
