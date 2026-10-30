import assert from "node:assert/strict";
import { test } from "node:test";
import { fetchAllPages } from "./pagination.js";

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

test("all 251 payroll records are available to tables, role totals and payable selection", async () => {
  const records = Array.from({ length: 251 }, (_, index) => ({
    id: index + 1,
    staff: { role: index < 100 ? "Waiter" : "Kitchen_manager" },
    status: index < 100 ? "draft" : "approved",
    net_salary: "10.00",
    remaining_balance: "10.00",
  }));
  const endpoint = paginatedEndpoint(records);
  const payrolls = await fetchAllPages(endpoint.fetchPage);
  const roleTotals = payrolls.reduce((totals, payroll) => {
    const role = payroll.staff.role;
    totals[role] = (totals[role] || 0) + Number(payroll.net_salary);
    return totals;
  }, {});
  const payable = payrolls.filter((payroll) => payroll.status !== "draft" && Number(payroll.remaining_balance) > 0);

  assert.deepEqual(payrolls, records);
  assert.deepEqual(roleTotals, { Waiter: 1000, Kitchen_manager: 1510 });
  assert.equal(payable.length, 151);
  assert.equal(payable.at(-1).id, 251);
  assert.deepEqual(endpoint.requests.map(({ page }) => page), [1, 2, 3]);
});

test("payroll payment history includes all 205 payments in original date order", async () => {
  const records = Array.from({ length: 205 }, (_, index) => ({ id: 205 - index, amount: "2.50" }));
  const endpoint = paginatedEndpoint(records);
  const payments = await fetchAllPages(endpoint.fetchPage);

  assert.deepEqual(payments, records);
  assert.equal(payments.reduce((total, payment) => total + Number(payment.amount), 0), 512.5);
  assert.equal(payments.at(-1).id, 1);
  assert.equal(endpoint.requests.length, 3);
});

test("salary advance history includes open and applied records beyond page one", async () => {
  const records = Array.from({ length: 201 }, (_, index) => ({
    id: index + 1,
    is_applied: index < 100,
    amount: "5.00",
  }));
  const endpoint = paginatedEndpoint(records);
  const advances = await fetchAllPages(endpoint.fetchPage);

  assert.deepEqual(advances, records);
  assert.equal(advances.filter((advance) => !advance.is_applied).length, 101);
  assert.equal(advances.reduce((total, advance) => total + Number(advance.amount), 0), 1005);
});

test("branch, employee, date, status, run type and search filters survive every page", async () => {
  const records = Array.from({ length: 137 }, (_, index) => ({ id: index + 1 }));
  const endpoint = paginatedEndpoint(records, 50);
  const params = {
    branch: 7,
    staff: 42,
    search: "older employee",
    status: "approved",
    period_type: "weekly",
    from: "2026-01-01",
    to: "2026-10-31",
    page: 99,
    page_size: 1,
  };

  assert.deepEqual(await fetchAllPages(endpoint.fetchPage, params), records);
  assert.deepEqual(endpoint.requests, [1, 2, 3].map((page) => ({ ...params, page, page_size: 100 })));
  assert.equal(params.page, 99);
  assert.equal(params.page_size, 1);
});

test("page-size boundaries and empty lists terminate without extra requests", async () => {
  for (const count of [0, 1, 99, 100, 101, 200, 201]) {
    const records = Array.from({ length: count }, (_, index) => ({ id: index + 1 }));
    const endpoint = paginatedEndpoint(records);
    assert.deepEqual(await fetchAllPages(endpoint.fetchPage), records);
    assert.equal(endpoint.requests.length, Math.max(1, Math.ceil(count / 100)));
  }
});

test("failed later pages never return an apparently complete partial payroll list", async () => {
  const endpoint = paginatedEndpoint(Array.from({ length: 101 }, (_, index) => ({ id: index + 1 })));
  await assert.rejects(fetchAllPages(async (params) => {
    if (params.page === 2) throw new Error("Payroll page unavailable");
    return endpoint.fetchPage(params);
  }), /Payroll page unavailable/);
});

test("reloading after a new payroll record does not reuse a truncated or cached list", async () => {
  const records = Array.from({ length: 100 }, (_, index) => ({ id: index + 1 }));
  const endpoint = paginatedEndpoint(records);
  const before = await fetchAllPages(endpoint.fetchPage);
  records.push({ id: 101 });
  const after = await fetchAllPages(endpoint.fetchPage);

  assert.equal(before.length, 100);
  assert.equal(after.length, 101);
  assert.equal(after.at(-1).id, 101);
  assert.deepEqual(endpoint.requests.map(({ page }) => page), [1, 1, 2]);
});
