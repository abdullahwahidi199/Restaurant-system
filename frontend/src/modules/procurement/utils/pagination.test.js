import assert from "node:assert/strict";
import { test } from "node:test";
import { getProcurementStats } from "./calculations.js";
import { fetchAllPages } from "./pagination.js";

function paginatedEndpoint(records, maxPageSize = 100) {
  const requests = [];
  const fetchPage = async (params) => {
    requests.push(params);
    const pageSize = Math.min(params.page_size, maxPageSize);
    const start = (params.page - 1) * pageSize;
    return {
      data: {
        count: records.length,
        results: records.slice(start, start + pageSize),
        next: start + pageSize < records.length ? `?page=${params.page + 1}` : null,
      },
    };
  };
  return { fetchPage, requests };
}

test("251 invoices all contribute to purchasing totals and payables, including records after page one", async () => {
  const date = new Date().toISOString().slice(0, 10);
  const invoices = Array.from({ length: 251 }, (_, index) => ({
    id: index + 1,
    status: "unpaid",
    purchase_date: date,
    total_amount: "10.00",
    remaining_balance: "10.00",
    supplier: 1,
  }));
  const endpoint = paginatedEndpoint(invoices);
  const allInvoices = await fetchAllPages(endpoint.fetchPage);
  const stats = getProcurementStats({ invoices: allInvoices, suppliers: [], payments: [] });

  assert.deepEqual(allInvoices, invoices);
  assert.equal(allInvoices.at(-1).id, 251);
  assert.equal(stats.purchasesThisMonth, 2510);
  assert.equal(stats.totalPurchasesToday, 2510);
  assert.equal(stats.unpaidInvoices.length, 251);
  assert.deepEqual(endpoint.requests.map(({ page }) => page), [1, 2, 3]);
  assert.ok(endpoint.requests.every(({ page_size }) => page_size === 100));
});

test("payments made includes payments from every page, not only the first 100", async () => {
  const payments = Array.from({ length: 205 }, (_, index) => ({ id: index + 1, amount: "2.00" }));
  const endpoint = paginatedEndpoint(payments);
  const allPayments = await fetchAllPages(endpoint.fetchPage);
  const stats = getProcurementStats({ invoices: [], suppliers: [], payments: allPayments });

  assert.equal(stats.paymentsMade, 410);
  assert.equal(allPayments.length, 205);
  assert.equal(endpoint.requests.length, 3);
});

test("search and status filters remain applied on every page, including when the server uses smaller pages", async () => {
  const records = Array.from({ length: 37 }, (_, index) => ({ id: index + 1 }));
  const endpoint = paginatedEndpoint(records, 15);
  const params = { search: "rice supplier", status: "partially_paid", page: 9 };

  assert.deepEqual(await fetchAllPages(endpoint.fetchPage, params), records);
  assert.deepEqual(endpoint.requests, [1, 2, 3].map((page) => ({
    search: "rice supplier", status: "partially_paid", page, page_size: 100,
  })));
  assert.equal(params.page, 9);
});

test("a later-page failure rejects the whole load rather than reporting incomplete totals", async () => {
  const endpoint = paginatedEndpoint(Array.from({ length: 101 }, (_, index) => ({ id: index + 1 })));
  const fetchPage = async (params) => {
    if (params.page === 2) throw new Error("Payment history unavailable");
    return endpoint.fetchPage(params);
  };

  await assert.rejects(fetchAllPages(fetchPage), /Payment history unavailable/);
});

test("empty and unpaginated responses remain supported", async () => {
  assert.deepEqual(await fetchAllPages(async () => ({ data: { count: 0, results: [], next: null } })), []);
  const records = [{ id: 1 }, { id: 2 }];
  assert.deepEqual(await fetchAllPages(async () => ({ data: records })), records);
});

test("overlapping pages do not count the same invoice twice", async () => {
  const allInvoices = await fetchAllPages(async ({ page }) => ({
    data: page === 1
      ? { results: [{ id: 1 }, { id: 2 }], next: "?page=2" }
      : { results: [{ id: 2 }, { id: 3 }], next: null },
  }));

  assert.deepEqual(allInvoices.map(({ id }) => id), [1, 2, 3]);
});

test("invalid or non-advancing pagination cannot silently return partial records", async () => {
  await assert.rejects(fetchAllPages(async () => ({ data: {} })), /complete list/);
  await assert.rejects(fetchAllPages(async () => ({
    data: { results: [{ id: 1 }], next: "?page=2" },
  })), /complete list/);
});
