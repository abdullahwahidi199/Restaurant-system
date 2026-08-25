import { useCallback, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  AlertTriangle,
  Archive,
  BadgeCheck,
  Boxes,
  ChevronDown,
  ClipboardList,
  Download,
  Edit3,
  Eye,
  Filter,
  GripVertical,
  ImageIcon,
  Layers3,
  LayoutGrid,
  List,
  Loader2,
  MoreVertical,
  PackageOpen,
  Pencil,
  Plus,
  Printer,
  RefreshCw,
  Search,
  Tag,
  Trash2,
  Utensils,
  X,
} from "lucide-react";

import AddCategoryModal from "./AddCategoryModal";
import AddItemModal from "./AddItemModal";
import CategoryDeleteModal from "./CategoryDeleteModal";
import EditCategoryModal from "./EditCategoryModal";
import PlatterAddModal from "./PlatterAddModal";
import instance from "../../../api/axiosInstance";
import useCategoryItems from "./useCategoryItems";
import {
  canonicalReorderPayload,
  compareMenuEntries,
  flattenMenuCategories,
  mergeCategoryEntries,
  sortMenuCategories,
} from "./menuOrdering";

const MEDIA_URL = import.meta.env.VITE_MEDIA_URL || "";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

function normalizeImageUrl(src) {
  if (!src) return "";
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  return `${MEDIA_URL}${src}`;
}

function formatPrice(value) {
  if (value === null || value === undefined || value === "") return "N/A";
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return value;
  return currencyFormatter.format(numeric);
}

function getCategoryItemCount(category) {
  return (
    (category?.menu_items?.length || 0) + (category?.platters?.length || 0)
  );
}

function flattenCategory(category) {
  return mergeCategoryEntries(category);
}

function getStatus(item) {
  if (item.final_availability) {
    return {
      label: "Available",
      className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
      icon: BadgeCheck,
    };
  }

  if (item.is_manually_available === false) {
    return {
      label: "Hidden",
      className: "bg-slate-100 text-slate-600 ring-slate-200",
      icon: Eye,
    };
  }

  if (
    item.uses_daily_production &&
    Number(item.production_remaining || 0) <= 0
  ) {
    return {
      label: "Sold out",
      className: "bg-rose-50 text-rose-700 ring-rose-200",
      icon: AlertTriangle,
    };
  }

  if (item.is_available === false) {
    return {
      label: "Out of stock",
      className: "bg-rose-50 text-rose-700 ring-rose-200",
      icon: AlertTriangle,
    };
  }

  return {
    label: "Unavailable",
    className: "bg-amber-50 text-amber-700 ring-amber-200",
    icon: AlertTriangle,
  };
}

function getDetailPath(item, detailBase) {
  if (!detailBase) return null;

  if (detailBase === "/kitchen") {
    return item.itemType === "menu_item"
      ? `/kitchen/menu/items/${item.id}`
      : null;
  }

  return item.itemType === "platter"
    ? `${detailBase}/menu/platter/${item.id}`
    : `${detailBase}/menu/item/${item.id}`;
}

function exportCsv(items) {
  const headers = ["Name", "Category", "Type", "Price", "Status"];
  const rows = items.map((item) => [
    item.name || "",
    item.categoryName || "",
    item.itemType === "platter" ? "Platter" : "Menu item",
    item.price || "",
    getStatus(item).label,
  ]);

  const escape = (value) => `"${String(value).replaceAll('"', '""')}"`;
  const csv = [headers, ...rows]
    .map((row) => row.map(escape).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "menu-export.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function splitCategoryEntries(items) {
  return items.reduce(
    (acc, item, index) => {
      const nextItem = { ...item, display_order: index };
      if (item.itemType === "platter") {
        acc.platters.push(nextItem);
      } else {
        acc.menu_items.push(nextItem);
      }
      return acc;
    },
    { menu_items: [], platters: [] },
  );
}

function moveEntry(items, activeKey, overKey) {
  const activeIndex = items.findIndex((item) => item.stableKey === activeKey);
  const overIndex = items.findIndex((item) => item.stableKey === overKey);
  if (activeIndex < 0 || overIndex < 0 || activeIndex === overIndex) {
    return items;
  }

  const next = [...items];
  const [moved] = next.splice(activeIndex, 1);
  next.splice(overIndex, 0, moved);
  return next.map((item, index) => ({ ...item, display_order: index }));
}

function Badge({ children, className = "", icon: Icon }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${className}`}
    >
      {Icon && <Icon className="h-3.5 w-3.5" />}
      {children}
    </span>
  );
}

function IconButton({ children, className = "", ...props }) {
  return (
    <button
      type="button"
      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:border-gray-300 hover:bg-gray-50 hover:text-gray-950 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

function PrimaryButton({ children, className = "", ...props }) {
  return (
    <button
      type="button"
      className={`inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-gray-950 px-3 text-xs font-semibold text-white shadow-sm transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

function SecondaryButton({ children, className = "", ...props }) {
  return (
    <button
      type="button"
      className={`inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-700 shadow-sm transition hover:border-gray-300 hover:bg-gray-50 hover:text-gray-950 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

function StatCard({ icon: Icon, label, value, tone = "slate" }) {
  const tones = {
    slate: "bg-slate-50 text-slate-700 ring-slate-200",
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    amber: "bg-amber-50 text-amber-700 ring-amber-200",
    rose: "bg-rose-50 text-rose-700 ring-rose-200",
    cyan: "bg-cyan-50 text-cyan-700 ring-cyan-200",
    violet: "bg-violet-50 text-violet-700 ring-violet-200",
  };

  return (
    <motion.div
      className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-lg font-semibold text-gray-950">{value}</p>
          <p className="text-xs font-medium text-gray-500">{label}</p>
        </div>
        <span
          className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ring-1 ${tones[tone]}`}
        >
          <Icon className="h-4 w-4" />
        </span>
      </div>
    </motion.div>
  );
}

function MenuSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-28 animate-pulse rounded-lg border border-gray-200 bg-white"
          />
        ))}
      </div>
      <div className="h-20 animate-pulse rounded-lg border border-gray-200 bg-white" />
      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <div className="h-96 animate-pulse rounded-lg border border-gray-200 bg-white" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-72 animate-pulse rounded-lg border border-gray-200 bg-white"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ canManage, onAddCategory, onAddItem, hasCategory }) {
  return (
    <div className="flex min-h-[380px] items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
      <div className="max-w-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
          <PackageOpen className="h-7 w-7" />
        </div>
        <h3 className="mt-5 text-lg font-semibold text-gray-950">
          No menu items yet
        </h3>
        <p className="mt-2 text-sm leading-6 text-gray-500">
          Create a category and add the first dish so staff can browse a clean,
          organized menu.
        </p>
        {canManage && (
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <SecondaryButton onClick={onAddCategory}>
              <Layers3 className="h-4 w-4" />
              Add category
            </SecondaryButton>
            <PrimaryButton onClick={onAddItem} disabled={!hasCategory}>
              <Plus className="h-4 w-4" />
              Add first item
            </PrimaryButton>
          </div>
        )}
      </div>
    </div>
  );
}

function CategoryRail({
  categories,
  selectedCategoryId,
  onSelect,
  canManage,
  onEdit,
}) {
  return (
    <aside className="rounded-lg border border-gray-200 bg-white p-2 shadow-sm">
      <div className="mb-2 flex items-center justify-between px-1">
        <div>
          <p className="text-sm font-semibold text-gray-950">Categories</p>
          <p className="text-xs text-gray-500">Menu groups and sort order</p>
        </div>
        <Badge className="bg-gray-50 text-gray-600 ring-gray-200">
          {categories.length}
        </Badge>
      </div>

      <div className="flex gap-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => onSelect("all")}
          className={`flex h-10 shrink-0 items-center gap-2 rounded-lg px-3 text-left transition focus:outline-none focus:ring-2 focus:ring-gray-900 ${
            String(selectedCategoryId) === "all"
              ? "bg-gray-950 text-white shadow-sm"
              : "text-gray-700 hover:bg-gray-50"
          }`}
        >
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-md ${
              String(selectedCategoryId) === "all"
                ? "bg-white/15"
                : "bg-gray-100"
            }`}
          >
            <Utensils className="h-4 w-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-xs font-semibold">
              All categories
            </span>
            <span
              className={`hidden text-xs ${
                String(selectedCategoryId) === "all"
                  ? "text-white/70"
                  : "text-gray-500"
              }`}
            >
              Complete menu
            </span>
          </span>
        </button>

        {categories.map((category) => {
          const isSelected = String(selectedCategoryId) === String(category.id);
          const count = getCategoryItemCount(category);

          return (
            <div key={category.id} className="group relative shrink-0">
              <button
                type="button"
                onClick={() => onSelect(category.id)}
                className={`flex h-10 min-w-[150px] max-w-[220px] items-center gap-2 rounded-lg px-2.5 text-left transition focus:outline-none focus:ring-2 focus:ring-gray-900 ${
                  isSelected
                    ? "bg-gray-950 text-white shadow-sm"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span
                  className={`hidden text-current/55 sm:inline-flex ${
                    isSelected ? "text-white/70" : "text-gray-300"
                  }`}
                >
                  <GripVertical className="h-3.5 w-3.5" />
                </span>
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-md ${
                    isSelected ? "bg-white/15" : "bg-gray-100"
                  }`}
                >
                  {category.image ? (
                    <img
                      src={normalizeImageUrl(category.image)}
                      alt=""
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <Tag className="h-3.5 w-3.5" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-semibold">
                    {category.name}
                  </span>
                  <span
                    className={`block text-[11px] ${
                      isSelected ? "text-white/70" : "text-gray-500"
                    }`}
                  >
                    {count} item{count === 1 ? "" : "s"}
                    {category.rank !== null &&
                    category.rank !== undefined &&
                    category.rank !== ""
                      ? ` · Rank ${category.rank}`
                      : ""}
                  </span>
                </span>
              </button>

              {canManage && (
                <button
                  type="button"
                  onClick={() => onEdit(category)}
                  aria-label={`Edit ${category.name}`}
                  className={`absolute right-1 top-1/2 hidden h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md border transition group-hover:flex ${
                    isSelected
                      ? "border-white/20 bg-white/10 text-white hover:bg-white/20"
                      : "border-gray-200 bg-white text-gray-500 shadow-sm hover:text-gray-950"
                  }`}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}

function ItemActionMenu({ item, detailPath, canManage, categories = [], onMoveItem }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <IconButton
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setOpen((value) => !value);
        }}
        aria-label={`Open actions for ${item.name}`}
        className="h-9 w-9"
      >
        <MoreVertical className="h-4 w-4" />
      </IconButton>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.14 }}
            className="absolute right-0 z-30 mt-2 w-48 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            {detailPath ? (
              <Link
                to={detailPath}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50 hover:text-gray-950"
              >
                {canManage ? (
                  <Edit3 className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                {canManage ? "Edit details" : "View details"}
              </Link>
            ) : (
              <div className="px-3 py-2 text-sm text-gray-400">View only</div>
            )}
            <button
              type="button"
              onClick={() => exportCsv([item])}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 transition hover:bg-gray-50 hover:text-gray-950"
            >
              <Download className="h-4 w-4" />
              Export row
            </button>
            {canManage && onMoveItem && (
              <label className="block border-t border-gray-100 px-3 py-2">
                <span className="mb-1 block text-xs font-semibold text-gray-500">
                  Move to
                </span>
                <select
                  value={item.categoryId || ""}
                  onChange={(event) => onMoveItem(item, event.target.value)}
                  className="h-8 w-full rounded-md border border-gray-200 bg-white px-2 text-xs text-gray-700 outline-none focus:border-gray-950"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SortableMenuItem({ item, disabled, children }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.stableKey, disabled });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={isDragging ? "z-20 opacity-70" : ""}
    >
      {children({
        isDragging,
        dragHandleProps: { ...attributes, ...listeners },
      })}
    </div>
  );
}

function ItemCard({
  item,
  canManage,
  detailBase,
  selected,
  onToggleSelected,
  dragHandleProps,
  isDragging,
  categories,
  onMoveItem,
}) {
  const status = getStatus(item);
  const detailPath = getDetailPath(item, detailBase);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group rounded-lg border bg-white p-2 shadow-sm transition hover:border-gray-300 hover:shadow-md ${
        isDragging ? "border-gray-950 shadow-xl" : "border-gray-200"
      }`}
    >
      <div className="flex items-center gap-2">
        {canManage && (
          <button
            type="button"
            {...dragHandleProps}
            className="inline-flex h-8 w-6 shrink-0 cursor-grab items-center justify-center rounded-md text-gray-300 transition hover:bg-gray-50 hover:text-gray-700 active:cursor-grabbing"
            aria-label={`Drag ${item.name}`}
          >
            <GripVertical className="h-4 w-4" />
          </button>
        )}
        <label
          className="inline-flex h-5 w-5 shrink-0 items-center justify-center"
          onClick={(event) => event.stopPropagation()}
        >
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onToggleSelected(item.stableKey)}
            className="h-4 w-4 rounded border-gray-300 text-gray-950 focus:ring-gray-950"
            aria-label={`Select ${item.name}`}
          />
        </label>
        <div className="h-12 w-14 shrink-0 overflow-hidden rounded-md bg-gray-100">
          {item.image ? (
            <img
              src={normalizeImageUrl(item.image)}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-gray-300">
              <ImageIcon className="h-5 w-5" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          {detailPath ? (
            <Link
              to={detailPath}
              className="block truncate text-sm font-semibold text-gray-950 hover:underline"
            >
              {item.name}
            </Link>
          ) : (
            <h3 className="truncate text-sm font-semibold text-gray-950">
              {item.name}
            </h3>
          )}
          <div className="mt-1 flex min-w-0 items-center gap-2">
            <span className="shrink-0 text-sm font-semibold text-gray-950">
              AFN {formatPrice(item.price)}
            </span>
            <span
              className={`inline-flex h-2 w-2 shrink-0 rounded-full ${
                item.final_availability ? "bg-emerald-500" : "bg-rose-500"
              }`}
              title={status.label}
            />
            <span className="truncate text-xs text-gray-500">
              {item.itemType === "platter" ? "Platter" : item.categoryName}
            </span>
          </div>
        </div>
        <ItemActionMenu
          item={item}
          detailPath={detailPath}
          canManage={canManage}
          categories={categories}
          onMoveItem={onMoveItem}
        />
      </div>
    </motion.article>
  );
}

function ItemTable({
  items,
  canManage,
  detailBase,
  selectedKeys,
  onToggleSelected,
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="hidden min-w-full lg:block">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-12 px-4 py-3" />
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                Item
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                Category
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                Price
              </th>
              <th className="w-16 px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((item) => {
              const status = getStatus(item);
              const StatusIcon = status.icon;
              const detailPath = getDetailPath(item, detailBase);

              return (
                <tr
                  key={item.stableKey}
                  className="transition hover:bg-gray-50/80"
                >
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedKeys.includes(item.stableKey)}
                      onChange={() => onToggleSelected(item.stableKey)}
                      className="h-4 w-4 rounded border-gray-300 text-gray-950 focus:ring-gray-950"
                      aria-label={`Select ${item.name}`}
                    />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 overflow-hidden rounded-lg bg-gray-100">
                        {item.image ? (
                          <img
                            src={normalizeImageUrl(item.image)}
                            alt=""
                            loading="lazy"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-gray-300">
                            <ImageIcon className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                      <div>
                        {detailPath ? (
                          <Link
                            to={detailPath}
                            className="font-semibold text-gray-950 hover:underline"
                          >
                            {item.name}
                          </Link>
                        ) : (
                          <p className="font-semibold text-gray-950">
                            {item.name}
                          </p>
                        )}
                        <p className="text-xs text-gray-500">
                          {item.itemType === "platter"
                            ? "Platter"
                            : "Menu item"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">
                    {item.categoryName}
                  </td>
                  <td className="px-4 py-4">
                    <Badge className={status.className} icon={StatusIcon}>
                      {status.label}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 text-sm font-semibold text-gray-950">
                    AFN {formatPrice(item.price)}
                  </td>
                  <td className="px-4 py-4">
                    <ItemActionMenu
                      item={item}
                      detailPath={detailPath}
                      canManage={canManage}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 p-3 lg:hidden">
        {items.map((item) => (
          <ItemCard
            key={item.stableKey}
            item={item}
            canManage={canManage}
            detailBase={detailBase}
            selected={selectedKeys.includes(item.stableKey)}
            onToggleSelected={onToggleSelected}
          />
        ))}
      </div>
    </div>
  );
}

export default function MenuWorkspace({
  categories,
  setCategories,
  loading,
  onRefresh,
  canManage = true,
  detailBase = "/admin/dashboard",
  title = "Menu Management",
  description = "Manage your restaurant menu, pricing, visibility and availability.",
  showPrintActions = true,
  isRTL = false,
}) {
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [showAddPlatter, setShowAddPlatter] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [showDeleteCategory, setShowDeleteCategory] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stationFilter, setStationFilter] = useState("all");
  const [sortBy, setSortBy] = useState("menu_order");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [printMode, setPrintMode] = useState("all");
  const [printing, setPrinting] = useState(false);
  const [stations, setStations] = useState([]);

  const queryClient = useQueryClient();
  const orderedCategories = useMemo(
    () => sortMenuCategories(categories),
    [categories],
  );
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // 1️⃣ Initialize from localStorage safely (handling string, number, and "all")
  const [selectedCategoryId, setSelectedCategoryIdState] = useState(() => {
    const saved = localStorage.getItem("selectedMenuCategoryId");
    if (!saved) return null;
    if (saved === "all") return "all";
    const num = Number(saved);
    return !Number.isNaN(num) ? num : saved;
  });

  // 2️⃣ Wrapper setter that saves to localStorage whenever the user clicks a category
  const setSelectedCategoryId = (id) => {
    setSelectedCategoryIdState(id);
    if (id !== null && id !== undefined) {
      localStorage.setItem("selectedMenuCategoryId", String(id));
    } else {
      localStorage.removeItem("selectedMenuCategoryId");
    }
  };

  // 3️⃣ SINGLE authoritative useEffect: synchronizes selected category without overwriting user's saved choice
  useEffect(() => {
    if (!orderedCategories || !orderedCategories.length) return;

    const saved = localStorage.getItem("selectedMenuCategoryId");

    // Case A: Saved selection is "all"
    if (saved === "all") {
      if (String(selectedCategoryId) !== "all") {
        setSelectedCategoryIdState("all");
      }
      return;
    }

    // Case B: A specific category ID is saved in localStorage and exists in our categories array
    if (saved && orderedCategories.some((c) => String(c.id) === String(saved))) {
      const targetCategory = orderedCategories.find(
        (c) => String(c.id) === String(saved),
      );
      if (String(selectedCategoryId) !== String(targetCategory.id)) {
        setSelectedCategoryIdState(targetCategory.id);
      }
      return;
    }

    // Case C: No valid saved category found -> default to first category without clobbering localStorage
    if (
      !selectedCategoryId ||
      (String(selectedCategoryId) !== "all" &&
        !orderedCategories.some(
          (c) => String(c.id) === String(selectedCategoryId),
        ))
    ) {
      const fallbackId = orderedCategories[0].id;
      setSelectedCategoryIdState(fallbackId);
      localStorage.setItem("selectedMenuCategoryId", String(fallbackId));
    }
  }, [orderedCategories]);

  const selectedCategory = useMemo(
    () =>
      orderedCategories.find(
        (category) => String(category.id) === String(selectedCategoryId),
      ),
    [orderedCategories, selectedCategoryId],
  );

  const {
    data: categoryItems = {},
    isFetching,
    isError,
    refetch,
  } = useCategoryItems(
    selectedCategoryId === "all" ? null : selectedCategoryId,
  );

  const allItems = useMemo(
    () => flattenMenuCategories(orderedCategories),
    [orderedCategories],
  );

  const scopedItems = useMemo(() => {
    if (selectedCategoryId === "all") return allItems;

    if (categoryItems?.id) {
      return flattenCategory({
        ...categoryItems,
        name: categoryItems.name || selectedCategory?.name,
      });
    }

    return selectedCategory ? flattenCategory(selectedCategory) : [];
  }, [allItems, categoryItems, selectedCategory, selectedCategoryId]);

  const stats = useMemo(() => {
    const menuItems = allItems.filter((item) => item.itemType === "menu_item");
    return {
      categories: orderedCategories.length,
      total: allItems.length,
      active: allItems.filter((item) => item.final_availability).length,
      hidden: allItems.filter((item) => item.is_manually_available === false)
        .length,
      platters: allItems.filter((item) => item.itemType === "platter").length,
      production: menuItems.filter((item) => item.uses_daily_production).length,
    };
  }, [allItems, orderedCategories.length]);

  const visibleItems = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return scopedItems
      .filter((item) => {
        const haystack =
          `${item.name || ""} ${item.categoryName || ""}`.toLowerCase();
        if (term && !haystack.includes(term)) return false;

        if (availabilityFilter === "available" && !item.final_availability) {
          return false;
        }
        if (stationFilter !== "all") {
          const itemStationId =
            item.station?.id ?? item.station ?? item.station_id ?? null;
          if (String(itemStationId) !== String(stationFilter)) {
            return false;
          }
        }
        if (availabilityFilter === "unavailable" && item.final_availability) {
          return false;
        }
        if (
          availabilityFilter === "production" &&
          !item.uses_daily_production
        ) {
          return false;
        }
        if (availabilityFilter === "platter" && item.itemType !== "platter") {
          return false;
        }

        if (
          statusFilter === "visible" &&
          item.is_manually_available === false
        ) {
          return false;
        }
        if (statusFilter === "hidden" && item.is_manually_available !== false) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "menu_order") return 0;
        if (sortBy === "price_high")
          return Number(b.price || 0) - Number(a.price || 0);
        if (sortBy === "price_low")
          return Number(a.price || 0) - Number(b.price || 0);
        if (sortBy === "availability") {
          return Number(b.final_availability) - Number(a.final_availability);
        }
        if (sortBy === "name_desc")
          return String(b.name || "").localeCompare(String(a.name || ""));
        return String(a.name || "").localeCompare(String(b.name || ""));
      });
  }, [
    availabilityFilter,
    scopedItems,
    searchTerm,
    sortBy,
    statusFilter,
    stationFilter,
  ]);

  const selectedItems = useMemo(
    () => allItems.filter((item) => selectedKeys.includes(item.stableKey)),
    [allItems, selectedKeys],
  );

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["categoryItems"] });
  }, []);
  useEffect(() => {
    setSelectedKeys((current) =>
      current.filter((key) => allItems.some((item) => item.stableKey === key)),
    );
  }, [allItems]);

  const selectedManageCategoryId =
    selectedCategoryId && selectedCategoryId !== "all"
      ? selectedCategoryId
      : orderedCategories[0]?.id;

  const fetchStations = async () => {
    try {
      const response = await instance.get("/menu/stations/");
      setStations(response.data);
    } catch (error) {
      console.error("Failed to fetch stations:", error);
    }
  };

  useEffect(() => {
    fetchStations();
  }, []);
  const handleCategoryAdded = () => {
    setShowAddCategory(false);
    onRefresh?.();
  };

  const handleItemAdded = () => {
    setShowAddItem(false);
    setShowAddPlatter(false);
    refetch();
    onRefresh?.();
  };

  const handleCategoryUpdated = (updatedCategory) => {
    setCategories?.((previous) =>
      previous.map((category) =>
        String(category.id) === String(updatedCategory.id)
          ? updatedCategory
          : category,
      ),
    );
    queryClient.invalidateQueries({
      queryKey: ["categoryItems", updatedCategory.id],
    });
  };

  const handleCategoryDeleted = () => {
    setShowDeleteCategory(false);
    queryClient.removeQueries({
      queryKey: ["categoryItems", selectedCategoryId],
    });
    onRefresh?.();
  };

  const applyCategoryOrder = useCallback(
    (categoryId, orderedItems) => {
      const split = splitCategoryEntries(orderedItems);
      setCategories?.((previous) =>
        previous.map((category) =>
          String(category.id) === String(categoryId)
            ? { ...category, ...split }
            : category,
        ),
      );
      queryClient.setQueryData(["categoryItems", categoryId], (previous) =>
        previous ? { ...previous, ...split } : previous,
      );
    },
    [queryClient, setCategories],
  );

  const handleItemDragEnd = useCallback(
    async ({ active, over }) => {
      if (
        !active?.id ||
        !over?.id ||
        active.id === over.id ||
        !canManage ||
        sortBy !== "menu_order" ||
        selectedCategoryId === "all"
      ) {
        return;
      }

      const fullOrder = [...scopedItems].sort(compareMenuEntries);
      const nextOrder = moveEntry(fullOrder, active.id, over.id);
      if (nextOrder === fullOrder) return;

      const previousCategories = categories;
      const previousCategoryItems = queryClient.getQueryData([
        "categoryItems",
        selectedCategoryId,
      ]);

      applyCategoryOrder(selectedCategoryId, nextOrder);

      try {
        await instance.post("/menu/menu-items/reorder/", {
          category_id: selectedCategoryId,
          items: canonicalReorderPayload(nextOrder),
        });
      } catch (error) {
        console.error("Failed to save menu order:", error);
        setCategories?.(previousCategories);
        queryClient.setQueryData(
          ["categoryItems", selectedCategoryId],
          previousCategoryItems,
        );
        toast.error("Failed to save menu order");
      }
    },
    [
      applyCategoryOrder,
      canManage,
      categories,
      queryClient,
      scopedItems,
      selectedCategoryId,
      setCategories,
      sortBy,
    ],
  );

  const handleMoveItem = useCallback(
    async (item, targetCategoryId) => {
      if (!targetCategoryId || String(targetCategoryId) === String(item.categoryId)) {
        return;
      }

      const targetCategory = orderedCategories.find(
        (category) => String(category.id) === String(targetCategoryId),
      );
      const sourceCategory = orderedCategories.find(
        (category) => String(category.id) === String(item.categoryId),
      );
      if (!targetCategory || !sourceCategory) return;

      const sourceItems = flattenCategory(sourceCategory).filter(
        (entry) => entry.stableKey !== item.stableKey,
      );
      const targetItems = [
        ...flattenCategory(targetCategory),
        {
          ...item,
          categoryId: targetCategory.id,
          categoryName: targetCategory.name,
          display_order: getCategoryItemCount(targetCategory),
        },
      ].sort(compareMenuEntries);

      const previousCategories = categories;
      const previousSourceCache = queryClient.getQueryData([
        "categoryItems",
        sourceCategory.id,
      ]);
      const previousTargetCache = queryClient.getQueryData([
        "categoryItems",
        targetCategory.id,
      ]);

      applyCategoryOrder(sourceCategory.id, sourceItems);
      applyCategoryOrder(targetCategory.id, targetItems);

      try {
        await instance.post("/menu/menu-items/reorder/", {
          category_id: targetCategory.id,
          source_category_id: sourceCategory.id,
          items: canonicalReorderPayload(targetItems),
        });
        setSelectedCategoryId(targetCategory.id);
      } catch (error) {
        console.error("Failed to move menu item:", error);
        setCategories?.(previousCategories);
        queryClient.setQueryData(["categoryItems", sourceCategory.id], previousSourceCache);
        queryClient.setQueryData(["categoryItems", targetCategory.id], previousTargetCache);
        toast.error("Failed to save menu order");
      }
    },
    [
      applyCategoryOrder,
      categories,
      orderedCategories,
      queryClient,
      setCategories,
      setSelectedCategoryId,
    ],
  );

  const handlePrint = async () => {
    setPrinting(true);
    try {
      let url = `/menu/menu-print/?mode=${printMode}`;

      if (
        printMode === "category" &&
        selectedCategoryId !== "all" &&
        selectedCategoryId
      ) {
        url += `&category=${selectedCategoryId}`;
      }

      const response = await instance.get(url, { responseType: "blob" });
      const file = new Blob([response.data], { type: "application/pdf" });
      const fileURL = URL.createObjectURL(file);
      const link = document.createElement("a");
      link.href = fileURL;
      link.download = "menu.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(fileURL);
    } catch (error) {
      console.error("PDF download failed:", error);
    } finally {
      setPrinting(false);
    }
  };

  const toggleSelected = (key) => {
    setSelectedKeys((current) =>
      current.includes(key)
        ? current.filter((selectedKey) => selectedKey !== key)
        : [...current, key],
    );
  };

  const clearFilters = () => {
    setSearchTerm("");
    setAvailabilityFilter("all");
    setStatusFilter("all");
    setSortBy("menu_order");
    setStationFilter("all");
  };

  const filtersActive =
    searchTerm ||
    availabilityFilter !== "all" ||
    statusFilter !== "all" ||
    stationFilter !== "all" ||
    sortBy !== "menu_order";

  return (
    <div className="min-h-screen bg-gray-50" dir={isRTL ? "rtl" : "ltr"}>
      <div className="mx-auto max-w-7xl space-y-3">
        <section className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <h1 className="text-xl font-semibold text-gray-950">
                {title}
              </h1>
              <p className="mt-1 text-xs leading-5 text-gray-500">
                {description}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <SecondaryButton onClick={onRefresh}>
                <RefreshCw className="h-4 w-4" />
                Refresh
              </SecondaryButton>
              <SecondaryButton
                onClick={() => exportCsv(visibleItems)}
                disabled={!visibleItems.length}
              >
                <Download className="h-4 w-4" />
                Export
              </SecondaryButton>
              {showPrintActions && (
                <SecondaryButton
                  onClick={handlePrint}
                  disabled={
                    printing ||
                    (printMode === "category" &&
                      (!selectedCategoryId || selectedCategoryId === "all"))
                  }
                >
                  {printing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Printer className="h-4 w-4" />
                  )}
                  PDF
                </SecondaryButton>
              )}
              {canManage && (
                <PrimaryButton
                  onClick={() => setShowAddItem(true)}
                  disabled={!selectedManageCategoryId}
                >
                  <Plus className="h-4 w-4" />
                  New item
                </PrimaryButton>
              )}
            </div>
          </div>
        </section>

        {loading ? (
          <MenuSkeleton />
        ) : (
          <>
            <section className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
              <StatCard
                icon={Layers3}
                label="Categories"
                value={stats.categories}
                tone="slate"
              />
              <StatCard
                icon={Utensils}
                label="Menu items"
                value={stats.total}
                tone="cyan"
              />
              <StatCard
                icon={BadgeCheck}
                label="Active"
                value={stats.active}
                tone="emerald"
              />
              <StatCard
                icon={Archive}
                label="Hidden"
                value={stats.hidden}
                tone="amber"
              />
              <StatCard
                icon={ClipboardList}
                label="Platters"
                value={stats.platters}
                tone="violet"
              />
              <StatCard
                icon={Boxes}
                label="Production"
                value={stats.production}
                tone="rose"
              />
            </section>

            <section className="rounded-lg border border-gray-200 bg-white p-2 shadow-sm">
              <div className="grid gap-2 lg:grid-cols-[minmax(220px,1.2fr)_repeat(4,minmax(130px,auto))]">
                <label className="relative block">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search dishes, platters, categories..."
                    className="h-9 w-full rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-3 text-xs text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-950 focus:bg-white focus:ring-2 focus:ring-gray-950/10"
                  />
                </label>

                <label className="relative">
                  <Utensils className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <select
                    value={stationFilter}
                    onChange={(event) => setStationFilter(event.target.value)}
                    className="h-9 w-full appearance-none rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-9 text-xs text-gray-700 outline-none transition focus:border-gray-950 focus:bg-white focus:ring-2 focus:ring-gray-950/10"
                  >
                    <option value="all">All stations</option>
                    {stations.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.name} {st.is_default ? "(Default)" : ""}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </label>
                <label className="relative">
                  <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <select
                    value={availabilityFilter}
                    onChange={(event) =>
                      setAvailabilityFilter(event.target.value)
                    }
                    className="h-9 w-full appearance-none rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-9 text-xs text-gray-700 outline-none transition focus:border-gray-950 focus:bg-white focus:ring-2 focus:ring-gray-950/10"
                  >
                    <option value="all">All availability</option>
                    <option value="available">Available</option>
                    <option value="unavailable">Unavailable</option>
                    <option value="production">Production items</option>
                    <option value="platter">Platters</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </label>

                <label className="relative">
                  <Eye className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    className="h-9 w-full appearance-none rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-9 text-xs text-gray-700 outline-none transition focus:border-gray-950 focus:bg-white focus:ring-2 focus:ring-gray-950/10"
                  >
                    <option value="all">All visibility</option>
                    <option value="visible">Visible</option>
                    <option value="hidden">Hidden</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </label>

                <label className="relative">
                  <List className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <select
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value)}
                    className="h-9 w-full appearance-none rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-9 text-xs text-gray-700 outline-none transition focus:border-gray-950 focus:bg-white focus:ring-2 focus:ring-gray-950/10"
                  >
                    <option value="menu_order">Menu order</option>
                    <option value="name">Name A-Z</option>
                    <option value="name_desc">Name Z-A</option>
                    <option value="price_high">Price high-low</option>
                    <option value="price_low">Price low-high</option>
                    <option value="availability">Availability</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </label>

                <div className="flex items-center gap-2">
                  <div className="inline-flex h-9 rounded-lg border border-gray-200 bg-gray-50 p-1">
                    <button
                      type="button"
                      onClick={() => setViewMode("grid")}
                      aria-label="Grid view"
                      className={`inline-flex h-7 w-7 items-center justify-center rounded-md transition ${
                        viewMode === "grid"
                          ? "bg-white text-gray-950 shadow-sm"
                          : "text-gray-500 hover:text-gray-950"
                      }`}
                    >
                      <LayoutGrid className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode("list")}
                      aria-label="List view"
                      className={`inline-flex h-7 w-7 items-center justify-center rounded-md transition ${
                        viewMode === "list"
                          ? "bg-white text-gray-950 shadow-sm"
                          : "text-gray-500 hover:text-gray-950"
                      }`}
                    >
                      <List className="h-4 w-4" />
                    </button>
                  </div>

                  {showPrintActions && (
                    <select
                      value={printMode}
                      onChange={(event) => setPrintMode(event.target.value)}
                      aria-label="PDF export mode"
                    className="h-9 min-w-0 flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 text-xs text-gray-700 outline-none transition focus:border-gray-950 focus:bg-white focus:ring-2 focus:ring-gray-950/10"
                    >
                      <option value="all">PDF: all</option>
                      <option value="available">PDF: available</option>
                      <option value="unavailable">PDF: unavailable</option>
                      <option value="category">PDF: category</option>
                    </select>
                  )}
                </div>
              </div>

              {filtersActive && (
                <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
                  <p className="text-sm text-gray-500">
                    Showing {visibleItems.length} of {scopedItems.length}{" "}
                    records
                  </p>
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-gray-700 transition hover:text-gray-950"
                  >
                    <X className="h-4 w-4" />
                    Clear filters
                  </button>
                </div>
              )}
            </section>

            <section className="space-y-3">
              <CategoryRail
                categories={orderedCategories}
                selectedCategoryId={selectedCategoryId}
                onSelect={setSelectedCategoryId}
                canManage={canManage}
                onEdit={setEditingCategory}
              />

              <div className="min-w-0 space-y-4">
                <div className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-gray-950">
                      {String(selectedCategoryId) === "all"
                        ? "All menu records"
                        : selectedCategory?.name || "Menu items"}
                    </h2>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {visibleItems.length} visible after filters
                    </p>
                  </div>

                  {canManage && (
                    <div className="flex flex-wrap items-center gap-2">
                      <SecondaryButton onClick={() => setShowAddCategory(true)}>
                        <Layers3 className="h-4 w-4" />
                        Category
                      </SecondaryButton>
                      <SecondaryButton
                        onClick={() => setShowDeleteCategory(true)}
                        disabled={
                          !selectedCategory ||
                          String(selectedCategoryId) === "all"
                        }
                        className="text-rose-700 hover:text-rose-800"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete category
                      </SecondaryButton>
                      <SecondaryButton
                        onClick={() => setShowAddPlatter(true)}
                        disabled={!selectedManageCategoryId}
                      >
                        <Layers3 className="h-4 w-4" />
                        Platter
                      </SecondaryButton>
                    </div>
                  )}
                </div>

                {isFetching && String(selectedCategoryId) !== "all" ? (
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <div
                        key={index}
                        className="h-72 animate-pulse rounded-lg border border-gray-200 bg-white"
                      />
                    ))}
                  </div>
                ) : isError ? (
                  <div className="rounded-lg border border-rose-200 bg-rose-50 p-6 text-sm font-medium text-rose-700">
                    Failed to load category items.
                  </div>
                ) : visibleItems.length ? (
                  viewMode === "grid" ? (
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleItemDragEnd}
                    >
                      <SortableContext
                        items={visibleItems.map((item) => item.stableKey)}
                        strategy={rectSortingStrategy}
                      >
                        <motion.div
                          layout
                          className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
                        >
                          {visibleItems.map((item) => (
                            <SortableMenuItem
                              key={item.stableKey}
                              item={item}
                              disabled={
                                !canManage ||
                                sortBy !== "menu_order" ||
                                selectedCategoryId === "all"
                              }
                            >
                              {({ dragHandleProps, isDragging }) => (
                                <ItemCard
                                  item={item}
                                  canManage={canManage}
                                  detailBase={detailBase}
                                  selected={selectedKeys.includes(item.stableKey)}
                                  onToggleSelected={toggleSelected}
                                  dragHandleProps={dragHandleProps}
                                  isDragging={isDragging}
                                  categories={orderedCategories}
                                  onMoveItem={handleMoveItem}
                                />
                              )}
                            </SortableMenuItem>
                          ))}
                        </motion.div>
                      </SortableContext>
                    </DndContext>
                  ) : (
                    <ItemTable
                      items={visibleItems}
                      canManage={canManage}
                      detailBase={detailBase}
                      selectedKeys={selectedKeys}
                      onToggleSelected={toggleSelected}
                    />
                  )
                ) : (
                  <EmptyState
                    canManage={canManage}
                    onAddCategory={() => setShowAddCategory(true)}
                    onAddItem={() => setShowAddItem(true)}
                    hasCategory={Boolean(selectedManageCategoryId)}
                  />
                )}
              </div>
            </section>
          </>
        )}
      </div>

      <AnimatePresence>
        {selectedItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            className="fixed bottom-5 left-1/2 z-40 w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 rounded-lg border border-gray-200 bg-white p-3 shadow-2xl"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-semibold text-gray-950">
                {selectedItems.length} selected
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <SecondaryButton
                  className="h-10"
                  onClick={() => exportCsv(selectedItems)}
                >
                  <Download className="h-4 w-4" />
                  Export selected
                </SecondaryButton>
                <SecondaryButton
                  className="h-10"
                  onClick={() => setSelectedKeys([])}
                >
                  Clear
                </SecondaryButton>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {showAddCategory && (
        <AddCategoryModal
          onClose={() => setShowAddCategory(false)}
          onCategoryAdded={handleCategoryAdded}
        />
      )}

      {showAddItem && (
        <AddItemModal
          onClose={() => setShowAddItem(false)}
          onItemAdded={handleItemAdded}
          selectedcategoryid={selectedManageCategoryId}
        />
      )}

      {showAddPlatter && (
        <PlatterAddModal
          onClose={() => setShowAddPlatter(false)}
          onItemAdded={handleItemAdded}
          selectedcategoryid={selectedManageCategoryId}
        />
      )}

      {editingCategory && (
        <EditCategoryModal
          category={editingCategory}
          onClose={() => setEditingCategory(null)}
          onCategoryUpdated={handleCategoryUpdated}
        />
      )}

      {showDeleteCategory && selectedCategory && (
        <CategoryDeleteModal
          categoryId={selectedCategory.id}
          title={`Delete ${selectedCategory.name}?`}
          message="This removes the category and the menu records attached to it. This action cannot be undone."
          onClose={() => setShowDeleteCategory(false)}
          onDelete={handleCategoryDeleted}
        />
      )}
    </div>
  );
}
