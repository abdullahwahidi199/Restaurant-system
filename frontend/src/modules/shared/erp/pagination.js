const PAGE_SIZE = 100;

// Keep the API's per-request limit while loading the complete matching list.
export async function fetchAllPages(fetchPage, params = {}) {
  const records = [];
  const seenIds = new Set();

  for (let page = 1; ; page += 1) {
    const response = await fetchPage({ ...params, page, page_size: PAGE_SIZE });
    const payload = response.data;
    const rows = Array.isArray(payload) ? payload : payload?.results;

    if (!Array.isArray(rows)) {
      throw new Error("Unable to load the complete list.");
    }

    const previousLength = records.length;
    for (const row of rows) {
      const id = row.id == null ? null : String(row.id);
      if (id !== null && seenIds.has(id)) continue;
      if (id !== null) seenIds.add(id);
      records.push(row);
    }

    if (Array.isArray(payload) || !payload.next) return records;
    if (records.length === previousLength) {
      throw new Error("Unable to load the complete list.");
    }
  }
}
