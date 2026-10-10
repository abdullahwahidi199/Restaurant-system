import React, { useCallback, useEffect, useMemo, useState } from "react";
import { CreditCard, Eye, Loader2, Plus } from "lucide-react";
import instance from "../../../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import { useTranslation as useAutoTranslation } from "react-i18next";
import PageHeader from "../../../modules/shared/erp/components/PageHeader";
import StatusBadge from "../../../modules/shared/erp/components/StatusBadge";
import EmptyState from "../../../modules/shared/erp/components/EmptyState";

const normalizeCards = (payload) =>
  Array.isArray(payload) ? payload : payload?.results || [];

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
};

export default function DiscountCardsMain() {
  const { t: autoT } = useAutoTranslation();
  const [discountCards, setDiscountCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchDiscountCards = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await instance.get("/orders/discount-cards/");
      setDiscountCards(normalizeCards(response.data));
    } catch (requestError) {
      console.error("Failed to fetch discount cards", requestError);
      setError(
        autoT("discount_cards.load_error", {
          defaultValue: "Could not load discount cards. Please try again.",
        }),
      );
    } finally {
      setLoading(false);
    }
  }, [autoT]);

  useEffect(() => {
    fetchDiscountCards();
  }, [fetchDiscountCards]);

  const activeCards = useMemo(
    () => discountCards.filter((card) => card.status === "active").length,
    [discountCards],
  );

  return (
    <section className="min-w-0 space-y-4">
      <PageHeader
        icon={CreditCard}
        title={autoT("legacy.discount_cards_c143a249")}
        description={autoT("discount_cards.description", {
          defaultValue: "Create, monitor, and manage reusable customer discount cards.",
        })}
        quickStats={[
          {
            label: autoT("discount_cards.total", { defaultValue: "Total cards" }),
            value: discountCards.length,
          },
          {
            label: autoT("inventory_manager.statuses.active", { defaultValue: "Active" }),
            value: activeCards,
          },
        ]}
        actions={
          <button
            type="button"
            onClick={() => navigate("/admin/dashboard/create-discount-cards")}
            className="theme-btn theme-btn-primary h-9 gap-2 px-3"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            {autoT("legacy.create_discount_card_c29e4d2c")}
          </button>
        }
      />

      {error && (
        <div className="rounded-lg border border-[var(--theme-danger)] bg-[var(--theme-danger-soft)] px-4 py-3 text-sm text-[var(--theme-danger-hover)]">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="theme-table overflow-hidden">
        {loading ? (
          <div className="flex min-h-48 items-center justify-center gap-2 theme-text-secondary">
            <Loader2 className="h-5 w-5 animate-spin text-[var(--theme-primary)]" />
            <span>{autoT("dashboard.loading")}</span>
          </div>
        ) : (
        <>
        <div className="space-y-2 p-3 md:hidden">
          {discountCards.length ? discountCards.map((card) => (
            <article key={card.id} className="rounded-lg border border-[var(--theme-border)] bg-[var(--theme-surface)] p-3">
              <div className="flex items-start justify-between gap-3 border-b border-[var(--theme-border)] pb-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold theme-text-primary">{card.card_name}</p>
                  <p className="mt-0.5 truncate font-mono text-xs theme-text-muted">{card.card_number}</p>
                </div>
                <StatusBadge status={card.status} label={card.status} />
              </div>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 py-3 text-xs">
                <div><dt className="theme-text-muted">{autoT("table.customer")}</dt><dd className="mt-0.5 font-medium theme-text-primary">{card.customer_name || "—"}</dd></div>
                <div><dt className="theme-text-muted">{autoT("legacy.discount_0cd95d41")}</dt><dd className="mt-0.5 font-semibold text-[var(--theme-primary-hover)]">{card.discount_percentage}%</dd></div>
                <div><dt className="theme-text-muted">{autoT("legacy.valid_until_a144230d")}</dt><dd className="mt-0.5 theme-text-secondary">{formatDate(card.valid_until)}</dd></div>
                <div><dt className="theme-text-muted">{autoT("legacy.usage_0bb18642")}</dt><dd className="mt-0.5 tabular-nums theme-text-secondary">{card.used_count || 0} / {card.usage_limit || "∞"}</dd></div>
              </dl>
              <div className="flex justify-end border-t border-[var(--theme-border)] pt-3">
                <button type="button" onClick={() => navigate(`/admin/dashboard/discount-cards/${card.id}`)} className="theme-btn theme-btn-outline h-8 gap-1.5 px-3 text-xs">
                  <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                  {autoT("inventory_manager.common.details")}
                </button>
              </div>
            </article>
          )) : <EmptyState title={autoT("legacy.no_discount_cards_found_09ae5411")} />}
        </div>
        <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[820px] rtl:text-right ltr:text-left">
          <thead>
            <tr>
              <th>{autoT("legacy.card_name_0f5975c9")}</th>
              <th>{autoT("legacy.card_number_b5e9a5e8")}</th>
              <th>{autoT("table.customer")}</th>
              <th>{autoT("legacy.discount_0cd95d41")}</th>
              <th>{autoT("table.status")}</th>
              <th>{autoT("legacy.valid_until_a144230d")}</th>
              <th>{autoT("legacy.usage_0bb18642")}</th>
              <th className="text-center">{autoT("inventory_manager.common.action")}</th>
            </tr>
          </thead>

          <tbody>
            {discountCards.map((card) => (
              <tr key={card.id} className="border-b border-[var(--theme-border)]">
                <td className="font-semibold theme-text-primary">{card.card_name}</td>

                <td className="font-mono text-xs theme-text-secondary">{card.card_number}</td>

                <td>{card.customer_name || "—"}</td>

                <td>
                  <span className="font-semibold tabular-nums text-[var(--theme-primary-hover)]">
                    {card.discount_percentage}%
                  </span>
                </td>

                <td>
                  <StatusBadge status={card.status} label={card.status} />
                </td>

                <td className="whitespace-nowrap">{formatDate(card.valid_until)}</td>

                <td className="whitespace-nowrap tabular-nums">
                  {card.used_count || 0} / {card.usage_limit || "∞"}
                </td>

                {/* Actions */}
                <td>
                  <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() =>
                      navigate(`/admin/dashboard/discount-cards/${card.id}`)
                    }
                    className="theme-btn theme-btn-outline theme-btn-icon text-[var(--theme-info)]"
                    aria-label={autoT("inventory_manager.common.details")}
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  </div>
                </td>
              </tr>
            ))}

            {discountCards.length === 0 && (
              <tr>
                <td colSpan="8" className="p-5">
                  <EmptyState title={autoT("legacy.no_discount_cards_found_09ae5411")} />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
        </>
        )}
    </div>
    </section>
  );
}
