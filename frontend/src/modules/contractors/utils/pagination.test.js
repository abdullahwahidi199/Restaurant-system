import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { fetchAllPages } from "../../shared/erp/pagination.js";
import { getPayableInvoices, getTopContractors } from "./calculations.js";

function paginatedEndpoint(records, maxPageSize = 100) {
  const requests = [];
  const fetchPage = async (params) => {
    requests.push(params);
    const size = Math.min(params.page_size, maxPageSize);
    const start = (params.page - 1) * size;
    return {
      data: {
        count: records.length,
        results: records.slice(start, start + size),
        next: start + size < records.length ? `?page=${params.page + 1}` : null,
      },
    };
  };
  return { fetchPage, requests };
}

test("all 251 contractors enter the directory, selection options and top-contractor ranking", async () => {
  const records = Array.from({ length: 251 }, (_, index) => ({
    id: index + 1,
    name: `Contractor ${String(index + 1).padStart(3, "0")}`,
    total_invoiced: String(index + 1),
  }));
  const endpoint = paginatedEndpoint(records);
  const contractors = await fetchAllPages(endpoint.fetchPage);

  assert.deepEqual(contractors, records);
  assert.deepEqual(getTopContractors(contractors).map(({ id }) => id), [251, 250, 249, 248, 247]);
  assert.deepEqual(endpoint.requests.map(({ page }) => page), [1, 2, 3]);
});

test("older service contracts after page one remain available for invoice linking", async () => {
  const records = Array.from({ length: 201 }, (_, index) => ({
    id: index + 1,
    contractor: index < 100 ? 1 : 2,
    status: index % 2 ? "active" : "completed",
  }));
  const endpoint = paginatedEndpoint(records);
  const contracts = await fetchAllPages(endpoint.fetchPage);

  assert.deepEqual(contracts, records);
  assert.equal(contracts.filter((contract) => contract.contractor === 2).length, 101);
  assert.equal(contracts.at(-1).id, 201);
});

test("service-invoice payables include older approved and partially paid invoices", async () => {
  const records = Array.from({ length: 251 }, (_, index) => ({
    id: index + 1,
    status: index < 100 ? "paid" : index === 250 ? "draft" : index % 2 ? "approved" : "partially_paid",
    remaining_balance: index < 100 ? "0.00" : "10.00",
  }));
  const endpoint = paginatedEndpoint(records);
  const invoices = await fetchAllPages(endpoint.fetchPage);
  const payable = getPayableInvoices(invoices);

  assert.deepEqual(invoices, records);
  assert.equal(payable.length, 150);
  assert.equal(payable.reduce((sum, invoice) => sum + Number(invoice.remaining_balance), 0), 1500);
  assert.equal(payable.at(-1).id, 250);
});

test("all 205 contractor payments contribute to payment-history coverage", async () => {
  const records = Array.from({ length: 205 }, (_, index) => ({ id: 205 - index, amount: "2.00" }));
  const endpoint = paginatedEndpoint(records);
  const payments = await fetchAllPages(endpoint.fetchPage);

  assert.deepEqual(payments, records);
  assert.equal(payments.reduce((sum, payment) => sum + Number(payment.amount), 0), 410);
  assert.equal(payments.at(-1).id, 1);
});

test("contractor-list filters are preserved across every server page", async () => {
  const filters = [
    { branch: 7, active: true, search: "Cleaning" },
    { branch: 7, contractor: 42, status: "active", search: "Maintenance" },
    { branch: 7, contractor: 42, contract: 13, status: "approved", search: "Repair", from: "2026-01-01", to: "2026-10-31" },
    { branch: 7, contractor: 42, invoice: 15, search: "Bank reference", from: "2026-01-01", to: "2026-10-31" },
  ];
  const records = Array.from({ length: 101 }, (_, index) => ({ id: index + 1 }));

  for (const params of filters) {
    const endpoint = paginatedEndpoint(records, 50);
    assert.deepEqual(await fetchAllPages(endpoint.fetchPage, params), records);
    assert.deepEqual(endpoint.requests, [1, 2, 3].map((page) => ({ ...params, page, page_size: 100 })));
  }
});

test("a failed later contractor page cannot return partial directory or payable totals", async () => {
  const endpoint = paginatedEndpoint(Array.from({ length: 101 }, (_, index) => ({ id: index + 1 })));
  await assert.rejects(fetchAllPages(async (params) => {
    if (params.page === 2) throw new Error("Contractor page unavailable");
    return endpoint.fetchPage(params);
  }), /Contractor page unavailable/);
});

test("initial and refresh paths use all-record loaders for all four contractor lists", async () => {
  const hook = await readFile(new URL("../hooks/useContractorWorkspace.js", import.meta.url), "utf8");
  const api = await readFile(new URL("../../../api/contractorApi.js", import.meta.url), "utf8");
  for (const [allLoader, pageLoader] of [
    ["getAllContractors", "getContractors"],
    ["getAllServiceContracts", "getServiceContracts"],
    ["getAllContractorInvoices", "getContractorInvoices"],
    ["getAllContractorPayments", "getContractorPayments"],
  ]) {
    assert.equal((hook.match(new RegExp(`\\b${allLoader}\\(`, "g")) || []).length, 2);
    assert.doesNotMatch(hook, new RegExp(`\\b${pageLoader}\\(`));
    assert.match(api, new RegExp(`${allLoader} = \\(params\\) =>\\s*fetchAllPages\\(${pageLoader}, params\\)`));
  }
});
