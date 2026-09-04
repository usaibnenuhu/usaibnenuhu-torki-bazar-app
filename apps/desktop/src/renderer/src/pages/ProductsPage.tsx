import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { call } from "../api/client";
import { Button } from "../components/Button";
import { Field, Input, Select } from "../components/Form";
import { Modal } from "../components/Modal";
import { useToastStore } from "../store/toastStore";

interface Product {
  id: string;
  name: string;
  sku: string | null;
  barcode: string | null;
  categoryId: string;
  subcategoryId: string | null;
  unitId: string;
  packSize: string | null;
  currentStock: string;
  description: string | null;
  status: string;
  category: { name: string };
  unit: { name: string; abbreviation: string };
}

interface Category {
  id: string;
  name: string;
  subcategories: {
    id: string;
    name: string;
  }[];
}

interface Unit {
  id: string;
  name: string;
  abbreviation: string;
}

const DISCRETE_UNIT_NAMES = [
  "piece",
  "pieces",
  "pc",
  "pcs",
  "pack",
  "packet",
  "box",
  "carton",
  "dozen",
  "bottle",
  "can",
  "bag",
];



const emptyForm = {
  name: "",
  categoryId: "",
  subcategoryId: "",
  sku: "",
  barcode: "",
  unitId: "",
  packSize: "",
  description: "",
};

function formatPackSize(
  p: Pick<Product, "packSize" | "unit">
) {
  if (p.packSize === null || p.packSize === "") {
    return "—";
  }

  return `${Number(p.packSize)} ${
    p.unit?.abbreviation ?? ""
  }`.trim();
}

function displayName(p: Product) {
  const pack = formatPackSize(p);

  return pack === "—"
    ? p.name
    : `${p.name} - ${pack}`;
}

/* =========================================================
   ICONS
========================================================= */

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-5 w-5"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-5 w-5"
    >
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

function PackageIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-6 w-6"
    >
      <path d="m21 8-9-5-9 5 9 5 9-5Z" />
      <path d="M3 8v8l9 5 9-5V8" />
      <path d="M12 13v8" />
    </svg>
  );
}

function StockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-6 w-6"
    >
      <path d="M4 19V9" />
      <path d="M10 19V5" />
      <path d="M16 19v-7" />
      <path d="M22 19V3" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
    </svg>
  );
}

function AdjustIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4"
    >
      <path d="M12 3v18" />
      <path d="m7 8 5-5 5 5" />
      <path d="m17 16-5 5-5-5" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
    >
      <rect
        x="4"
        y="4"
        width="6"
        height="6"
        rx="1"
      />
      <rect
        x="14"
        y="4"
        width="6"
        height="6"
        rx="1"
      />
      <rect
        x="4"
        y="14"
        width="6"
        height="6"
        rx="1"
      />
      <rect
        x="14"
        y="14"
        width="6"
        height="6"
        rx="1"
      />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
    >
      <path d="M8 6h13" />
      <path d="M8 12h13" />
      <path d="M8 18h13" />
      <path d="M3 6h.01" />
      <path d="M3 12h.01" />
      <path d="M3 18h.01" />
    </svg>
  );
}

/* =========================================================
   PRODUCT VISUAL
========================================================= */

function ProductVisual({
  name,
}: {
  name: string;
}) {
  const firstLetter =
    name.trim().charAt(0).toUpperCase() || "P";

  return (
    <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-emerald-50 via-white to-green-100 shadow-sm">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.16),transparent_55%)]" />

      <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-white text-xl font-bold text-emerald-600 shadow-sm ring-1 ring-emerald-100">
        {firstLetter}
      </div>
    </div>
  );
}

/* =========================================================
   INITIAL LOADING SKELETON
========================================================= */

function ProductSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="animate-pulse p-5">
            <div className="flex items-start gap-4">
              <div className="h-20 w-20 shrink-0 rounded-2xl bg-slate-200" />

              <div className="min-w-0 flex-1">
                <div className="h-4 w-3/4 rounded bg-slate-200" />
                <div className="mt-3 h-3 w-1/2 rounded bg-slate-100" />
                <div className="mt-3 h-3 w-2/3 rounded bg-slate-100" />
              </div>
            </div>

            <div className="mt-5 h-6 w-24 rounded-lg bg-slate-100" />

            <div className="mt-5 h-8 w-32 rounded bg-slate-100" />
          </div>

          <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-3">
            <div className="flex gap-2">
              <div className="h-10 flex-1 animate-pulse rounded-xl bg-slate-200" />
              <div className="h-10 flex-1 animate-pulse rounded-xl bg-slate-200" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] =
    useState<Category[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);

  const [search, setSearch] = useState("");

  const [categoryFilter, setCategoryFilter] =
    useState("ALL");

  const [stockFilter, setStockFilter] =
    useState("ALL");

  /*
   * IMPORTANT:
   *
   * This is ONLY for the very first page load.
   *
   * We do NOT use this for search.
   */
  const [initialLoading, setInitialLoading] =
    useState(true);

  /*
   * Used for a small "searching" indicator.
   *
   * This does NOT hide the existing products.
   */
  const [searching, setSearching] =
    useState(false);

  const [modalOpen, setModalOpen] =
    useState(false);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [saving, setSaving] =
    useState(false);

  const [adjustTarget, setAdjustTarget] =
    useState<Product | null>(null);

  const [adjustForm, setAdjustForm] =
    useState({
      quantity: "",
      direction: "ADD" as "ADD" | "REMOVE",
      reason: "",
    });

  const [adjusting, setAdjusting] =
    useState(false);

  const [viewMode, setViewMode] =
    useState<"grid" | "list">("grid");

  const [form, setForm] =
    useState(emptyForm);

  const push = useToastStore(
    (s) => s.push
  );

  /*
   * =======================================================
   * REQUEST ID
   * =======================================================
   *
   * This is very important.
   *
   * Imagine:
   *
   * search "rice"  -> request A
   * search "rice b" -> request B
   *
   * If A is slower than B, A could finish AFTER B and
   * overwrite the newer results.
   *
   * requestId prevents that.
   */
  const requestIdRef = useRef(0);

  /*
   * Prevent state updates after the page has unmounted.
   */
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  /* =======================================================
     LOAD PRODUCTS
  ======================================================= */

  const loadProducts = useCallback(
    async (
      q = "",
      options?: {
        initial?: boolean;
        silent?: boolean;
      }
    ) => {
      const requestId =
        ++requestIdRef.current;

      const isInitial =
        options?.initial === true;

      /*
       * ONLY the first load gets the full-page skeleton.
       *
       * Search requests are silent and keep the old
       * products visible.
       */
      if (isInitial) {
        setInitialLoading(true);
      }

      if (!isInitial && !options?.silent) {
        setSearching(true);
      }

      try {
        const result = await call<{
          items: Product[];
        }>("products:search", {
          search: q,
        });

        /*
         * Ignore stale responses.
         */
        if (
          requestId !==
          requestIdRef.current
        ) {
          return;
        }

        if (!mountedRef.current) {
          return;
        }

        setProducts(result.items);
      } catch (e) {
        /*
         * Ignore stale request errors too.
         */
        if (
          requestId !==
          requestIdRef.current
        ) {
          return;
        }

        if (!mountedRef.current) {
          return;
        }

        push(
          e instanceof Error
            ? e.message
            : "Failed to load products",
          "error"
        );
      } finally {
        if (
          requestId ===
          requestIdRef.current
        ) {
          if (mountedRef.current) {
            if (isInitial) {
              setInitialLoading(false);
            }

            if (!options?.silent) {
              setSearching(false);
            }
          }
        }
      }
    },
    [push]
  );

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    /*
     * We intentionally have ONE initialization effect.
     *
     * There is no separate search effect running with ""
     * on mount.
     */
    void loadProducts("", {
      initial: true,
    });

    let cancelled = false;

    async function loadCategories() {
      try {
        const result =
          await call<Category[]>(
            "catalog:categories:list"
          );

        if (!cancelled) {
          setCategories(result);
        }
      } catch {
        // Categories are optional for initial rendering.
      }
    }

    async function loadUnits() {
      try {
        const result =
          await call<Unit[]>(
            "catalog:units:list"
          );

        if (cancelled) {
          return;
        }

        if (!cancelled) {
          setUnits(result ?? []);
        }
      } catch {
        if (!cancelled) {
          setUnits([]);
        }
      }
    }

    void loadCategories();
    void loadUnits();

    return () => {
      cancelled = true;
    };
  }, [loadProducts]);

  /* =======================================================
     SEARCH
  ======================================================= */

  useEffect(() => {
    /*
     * IMPORTANT:
     *
     * Empty search is allowed here, but the debounce means
     * it does not immediately fire during the first render.
     *
     * More importantly, search never turns initialLoading
     * back on.
     */

    const timer =
      window.setTimeout(() => {
        /*
         * Don't reload if this is still the initial empty
         * search and the first request is already running.
         */
        if (
          search === "" &&
          initialLoading &&
          products.length === 0
        ) {
          return;
        }

        void loadProducts(search, {
          silent: false,
        });
      }, 300);

    return () =>
      window.clearTimeout(timer);
  }, [
    search,
    loadProducts,
    initialLoading,
    products.length,
  ]);

  /* =======================================================
     CREATE
  ======================================================= */

  function openCreate() {
    setEditingId(null);
    setForm({ ...emptyForm });
    setModalOpen(true);
  }

  /* =======================================================
     EDIT
  ======================================================= */

  function openEdit(p: Product) {
    setEditingId(p.id);

    setForm({
      name: p.name,
      categoryId: p.categoryId,
      subcategoryId:
        p.subcategoryId ?? "",
      sku: p.sku ?? "",
      barcode: p.barcode ?? "",
      unitId: p.unitId,
      packSize:
        p.packSize === null
          ? ""
          : String(Number(p.packSize)),
      description:
        p.description ?? "",
    });

    setModalOpen(true);
  }

  /* =======================================================
     SELECTED UNIT
  ======================================================= */

  const selectedUnit = units.find(
    (u) => u.id === form.unitId
  );

  const packMustBeWhole =
    !!selectedUnit &&
    DISCRETE_UNIT_NAMES.includes(
      selectedUnit.name
        .trim()
        .toLowerCase()
    );

  /* =======================================================
     SELECTED CATEGORY
  ======================================================= */

  const selectedCategory =
    categories.find(
      (c) => c.id === form.categoryId
    );

  /* =======================================================
     SAVE PRODUCT
  ======================================================= */

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (
      form.packSize !== "" &&
      Number(form.packSize) <= 0
    ) {
      push(
        "Pack size must be greater than zero.",
        "error"
      );
      return;
    }

    if (
      form.packSize !== "" &&
      packMustBeWhole &&
      !Number.isInteger(
        Number(form.packSize)
      )
    ) {
      push(
        `Pack size for ${selectedUnit?.name} must be a whole number.`,
        "error"
      );
      return;
    }

    setSaving(true);

    const blank = editingId
      ? null
      : undefined;

    const payload = {
      name: form.name,
      categoryId: form.categoryId,
      subcategoryId:
        form.subcategoryId || blank,
      sku:
        form.sku.trim() || blank,
      barcode:
        form.barcode.trim() || blank,
      unitId: form.unitId,
      packSize:
        form.packSize === ""
          ? null
          : Number(form.packSize),
      description:
        form.description || blank,
    };

    try {
      if (editingId) {
        await call("products:update", {
          id: editingId,
          ...payload,
        });

        push(
          "Product updated successfully.",
          "success"
        );
      } else {
        await call(
          "products:create",
          payload
        );

        push(
          "Product created successfully.",
          "success"
        );
      }

      setModalOpen(false);

      /*
       * Silent refresh.
       *
       * The existing products stay visible while the
       * refreshed data arrives.
       */
      await loadProducts(search, {
        silent: true,
      });
    } catch (err) {
      push(
        err instanceof Error
          ? err.message
          : "Failed to save product",
        "error"
      );
    } finally {
      setSaving(false);
    }
  }

  /* =======================================================
     OPEN STOCK ADJUSTMENT
  ======================================================= */

  function openAdjust(p: Product) {
    setAdjustForm({
      quantity: "",
      direction: "ADD",
      reason: "",
    });

    setAdjustTarget(p);
  }

  /* =======================================================
     STOCK ADJUSTMENT
  ======================================================= */

  async function handleAdjust(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (!adjustTarget) {
      return;
    }

    const quantity = Number(
      adjustForm.quantity
    );

    if (
      !Number.isFinite(quantity) ||
      quantity <= 0
    ) {
      push(
        "Adjustment quantity must be greater than zero.",
        "error"
      );
      return;
    }

    setAdjusting(true);

    try {
      await call(
        "inventory:adjustStock",
        {
          productId: adjustTarget.id,
          quantity,
          direction:
            adjustForm.direction,
          reason:
            adjustForm.reason ||
            undefined,
        }
      );

      push(
        "Stock adjusted successfully.",
        "success"
      );

      setAdjustTarget(null);

      /*
       * Silent refresh — NO skeleton.
       */
      await loadProducts(search, {
        silent: true,
      });
    } catch (err) {
      push(
        err instanceof Error
          ? err.message
          : "Failed to adjust stock",
        "error"
      );
    } finally {
      setAdjusting(false);
    }
  }

  /* =======================================================
     FILTER PRODUCTS
  ======================================================= */

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const categoryMatches =
        categoryFilter === "ALL" ||
        p.categoryId === categoryFilter;

      const stock = Number(
        p.currentStock
      );

      let stockMatches = true;

      if (stockFilter === "OUT") {
        stockMatches = stock <= 0;
      }

      if (stockFilter === "HEALTHY") {
        stockMatches = stock > 0;
      }

      return (
        categoryMatches &&
        stockMatches
      );
    });
  }, [
    products,
    categoryFilter,
    stockFilter,
  ]);

  /* =======================================================
     DASHBOARD NUMBERS
  ======================================================= */

  const totalProducts =
    products.length;

  const outOfStockProducts =
    products.filter(
      (p) =>
        Number(p.currentStock) <= 0
    ).length;

  const activeProducts =
    products.filter(
      (p) =>
        p.status.toUpperCase() ===
        "ACTIVE"
    ).length;

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-full space-y-6 pb-10">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

        <div>
          <div className="flex items-center gap-2">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <PackageIcon />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Products
              </h1>

              <p className="text-sm text-slate-500">
                Manage your catalog and
                inventory.
              </p>
            </div>

          </div>
        </div>

        <Button
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 shadow-sm"
        >
          <PlusIcon />
          New Product
        </Button>

      </div>

      {/* =================================================
          STAT CARDS
      ================================================= */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">

        {/* TOTAL */}

        <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">

          <div className="flex items-start justify-between">

            <div>
              <p className="text-sm font-medium text-slate-500">
                Total Products
              </p>

              <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                {totalProducts}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Products in catalog
              </p>
            </div>

            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
              <PackageIcon />
            </div>

          </div>

        </div>

        {/* ACTIVE */}

        <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">

          <div className="flex items-start justify-between">

            <div>
              <p className="text-sm font-medium text-slate-500">
                Active Products
              </p>

              <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                {activeProducts}
              </p>

              <p className="mt-1 text-xs text-emerald-600">
                Currently available
              </p>
            </div>

            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
              <StockIcon />
            </div>

          </div>

        </div>

        {/* OUT OF STOCK */}

        <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">

          <div className="flex items-start justify-between">

            <div>
              <p className="text-sm font-medium text-slate-500">
                Out of Stock
              </p>

              <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                {outOfStockProducts}
              </p>

              <p className="mt-1 text-xs text-red-500">
                Restock required
              </p>
            </div>

            <div className="rounded-xl bg-red-50 p-3 text-red-600">
              <StockIcon />
            </div>

          </div>

        </div>

      </div>

      {/* =================================================
          SEARCH + FILTERS
      ================================================= */}

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">

          {/* SEARCH */}

          <div className="relative flex-1">

            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <SearchIcon />
            </div>

            <input
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-10 text-sm outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-50"
              placeholder="Search products, SKU or barcode..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

            {search && (
              <button
                type="button"
                onClick={() =>
                  setSearch("")
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-lg text-slate-400 transition hover:text-slate-700"
              >
                ×
              </button>
            )}

            {/* SEARCHING INDICATOR */}

            {searching && (
              <div className="pointer-events-none absolute right-10 top-1/2 -translate-y-1/2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-500" />
              </div>
            )}

          </div>

          {/* CATEGORY */}

          <select
            value={categoryFilter}
            onChange={(e) =>
              setCategoryFilter(
                e.target.value
              )
            }
            className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-50"
          >
            <option value="ALL">
              All Categories
            </option>

            {categories.map(
              (category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </option>
              )
            )}
          </select>

          {/* STOCK */}

          <select
            value={stockFilter}
            onChange={(e) =>
              setStockFilter(
                e.target.value
              )
            }
            className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-50"
          >
            <option value="ALL">
              All Stock
            </option>

            <option value="HEALTHY">
              In Stock
            </option>

            <option value="OUT">
              Out of Stock
            </option>
          </select>

          {/* VIEW SWITCHER */}

          <div className="flex h-11 items-center rounded-xl border border-slate-200 bg-slate-50 p-1">

            <button
              type="button"
              onClick={() =>
                setViewMode("grid")
              }
              className={`flex h-9 items-center justify-center rounded-lg px-3 transition ${
                viewMode === "grid"
                  ? "bg-white text-emerald-600 shadow-sm"
                  : "text-slate-400 hover:text-slate-700"
              }`}
              title="Grid view"
            >
              <GridIcon />
            </button>

            <button
              type="button"
              onClick={() =>
                setViewMode("list")
              }
              className={`flex h-9 items-center justify-center rounded-lg px-3 transition ${
                viewMode === "list"
                  ? "bg-white text-emerald-600 shadow-sm"
                  : "text-slate-400 hover:text-slate-700"
              }`}
              title="List view"
            >
              <ListIcon />
            </button>

          </div>

        </div>

        <div className="mt-3 flex items-center justify-between">

          <p className="text-xs text-slate-400">
            Showing{" "}
            <span className="font-semibold text-slate-600">
              {filteredProducts.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-600">
              {products.length}
            </span>{" "}
            products
          </p>

          {(categoryFilter !==
            "ALL" ||
            stockFilter !== "ALL" ||
            search) && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setCategoryFilter("ALL");
                setStockFilter("ALL");
              }}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
            >
              Clear filters
            </button>
          )}

        </div>

      </div>

      {/* =================================================
          PRODUCTS
      ================================================= */}

      {initialLoading ? (
        /*
         * ONLY FIRST LOAD SHOWS SKELETON.
         *
         * Search does NOT reach this branch.
         */
        <ProductSkeleton />
      ) : filteredProducts.length === 0 ? (

        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <PackageIcon />
          </div>

          <h3 className="mt-4 text-base font-semibold text-slate-800">
            No products found
          </h3>

          <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
            Try changing your search or
            filters, or create a new
            product.
          </p>

          <button
            type="button"
            onClick={openCreate}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
          >
            <PlusIcon />
            Create Product
          </button>

        </div>

      ) : viewMode === "grid" ? (

        /* =================================================
           GRID VIEW
        ================================================= */

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">

          {filteredProducts.map((p) => {
            const stock =
              Number(p.currentStock);

            const isOut = stock <= 0;

            return (
              <div
                key={p.id}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >

                <div className="p-5">

                  <div className="flex items-start gap-4">

                    <ProductVisual
                      name={p.name}
                    />

                    <div className="min-w-0 flex-1">

                      <div className="flex items-start justify-between gap-2">

                        <div className="min-w-0">

                          <h3 className="truncate text-base font-bold text-slate-900">
                            {p.name}
                          </h3>

                          {p.packSize && (
                            <p className="mt-0.5 text-xs text-slate-500">
                              {formatPackSize(
                                p
                              )}
                            </p>
                          )}

                        </div>

                        <span
                          className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                            p.status.toUpperCase() ===
                            "ACTIVE"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {p.status}
                        </span>

                      </div>

                      <p className="mt-2 text-xs text-slate-400">
                        SKU:{" "}
                        <span className="font-medium text-slate-600">
                          {p.sku ||
                            "Not assigned"}
                        </span>
                      </p>

                    </div>

                  </div>

                  <div className="mt-5 flex items-center gap-2">

                    <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                      {p.category?.name ||
                        "Uncategorized"}
                    </span>

                  </div>

                  <div className="mt-5 flex items-end justify-between">

                    <div>

                      <p className="text-xs font-medium text-slate-400">
                        Current Stock
                      </p>

                      <p
                        className={`mt-1 text-lg font-bold ${
                          isOut
                            ? "text-red-600"
                            : "text-emerald-600"
                        }`}
                      >
                        {stock}{" "}
                        {p.unit?.abbreviation}
                      </p>

                    </div>

                  </div>

                </div>

                <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-3">

                  <div className="flex gap-2">

                    <button
                      type="button"
                      onClick={() =>
                        openEdit(p)
                      }
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                    >
                      <EditIcon />
                      Edit Product
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        openAdjust(p)
                      }
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-emerald-700"
                    >
                      <AdjustIcon />
                      Adjust Stock
                    </button>

                  </div>

                </div>

              </div>
            );
          })}

        </div>

      ) : (

        /* =================================================
           LIST VIEW
        ================================================= */

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="overflow-x-auto">

            <table className="min-w-full">

              <thead className="border-b border-slate-200 bg-slate-50">

                <tr>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                    Product
                  </th>

                  <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                    Category
                  </th>

                  <th className="px-4 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-400">
                    Stock
                  </th>

                  <th className="px-4 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-400">
                    Status
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-400">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-slate-100">

                {filteredProducts.map((p) => {
                  const stock =
                    Number(p.currentStock);

                  const isOut = stock <= 0;

                  return (
                    <tr
                      key={p.id}
                      className="group transition hover:bg-slate-50/80"
                    >

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-3">

                          <ProductVisual
                            name={p.name}
                          />

                          <div>
                            <p className="font-semibold text-slate-900">
                              {displayName(
                                p
                              )}
                            </p>

                            <p className="mt-0.5 text-xs text-slate-400">
                              SKU:{" "}
                              {p.sku ||
                                "Not assigned"}
                            </p>
                          </div>

                        </div>

                      </td>

                      <td className="px-4 py-4">

                        <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                          {p.category?.name ||
                            "Uncategorized"}
                        </span>

                      </td>

                      <td className="px-4 py-4 text-right">

                        <p
                          className={`font-bold ${
                            isOut
                              ? "text-red-600"
                              : "text-emerald-600"
                          }`}
                        >
                          {stock}{" "}
                          {p.unit?.abbreviation}
                        </p>

                      </td>

                      <td className="px-4 py-4 text-center">

                        <span
                          className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide ${
                            p.status.toUpperCase() ===
                            "ACTIVE"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {p.status}
                        </span>

                      </td>

                      <td className="px-5 py-4">

                        <div className="flex justify-end gap-2">

                          <button
                            type="button"
                            onClick={() =>
                              openEdit(p)
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                          >
                            <EditIcon />
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              openAdjust(p)
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700"
                          >
                            <AdjustIcon />
                            Stock
                          </button>

                        </div>

                      </td>

                    </tr>
                  );
                })}

              </tbody>

            </table>

          </div>

        </div>
      )}

      {/* =================================================
          CREATE / EDIT PRODUCT MODAL
      ================================================= */}

      <Modal
        open={modalOpen}
        title={
          editingId
            ? "Edit Product"
            : "Create New Product"
        }
        onClose={() =>
          setModalOpen(false)
        }
        wide
      >

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

            <div className="mb-4">

              <h3 className="font-semibold text-slate-900">
                Product Information
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Basic information about this
                product.
              </p>

            </div>

            <div className="space-y-4">

              <Field label="Product name">

                <Input
                  required
                  placeholder="e.g. Minikate Rice"
                  value={form.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value,
                    })
                  }
                />

              </Field>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                <Field label="Category">

                  <Select
                    required
                    value={
                      form.categoryId
                    }
                    onChange={(e) =>
                      setForm({
                        ...form,
                        categoryId:
                          e.target.value,
                        subcategoryId:
                          "",
                      })
                    }
                  >

                    <option value="">
                      Select category...
                    </option>

                    {categories.map(
                      (c) => (
                        <option
                          key={c.id}
                          value={c.id}
                        >
                          {c.name}
                        </option>
                      )
                    )}

                  </Select>

                </Field>

                <Field label="Subcategory">

                  <Select
                    value={
                      form.subcategoryId
                    }
                    onChange={(e) =>
                      setForm({
                        ...form,
                        subcategoryId:
                          e.target.value,
                      })
                    }
                  >

                    <option value="">
                      None
                    </option>

                    {selectedCategory?.subcategories.map(
                      (s) => (
                        <option
                          key={s.id}
                          value={s.id}
                        >
                          {s.name}
                        </option>
                      )
                    )}

                  </Select>

                </Field>

              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                <Field label="SKU">

                  <Input
                    placeholder="Optional"
                    value={form.sku}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        sku: e.target.value,
                      })
                    }
                  />

                </Field>

                <Field label="Barcode">

                  <Input
                    placeholder="Optional"
                    value={form.barcode}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        barcode:
                          e.target.value,
                      })
                    }
                  />

                </Field>

              </div>

            </div>

          </div>

          {/* PACKAGING */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5">

            <div className="mb-4">

              <h3 className="font-semibold text-slate-900">
                Packaging
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Define the unit and package
                size.
              </p>

            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

              <Field label="Unit">

                <Select
                  required
                  value={form.unitId}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      unitId:
                        e.target.value,
                    })
                  }
                >

                  <option value="">
                    Select unit...
                  </option>

                  {units.map((u) => (
                    <option
                      key={u.id}
                      value={u.id}
                    >
                      {u.name} (
                      {u.abbreviation})
                    </option>
                  ))}

                </Select>

              </Field>

              <Field
                label={`Pack size (optional)${
                  selectedUnit
                    ? ` — ${selectedUnit.abbreviation}`
                    : ""
                }`}
              >

                <Input
                  type="number"
                  min={0}
                  step={
                    packMustBeWhole
                      ? 1
                      : "any"
                  }
                  placeholder={
                    packMustBeWhole
                      ? "e.g. 12"
                      : "e.g. 500"
                  }
                  value={form.packSize}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      packSize:
                        e.target.value,
                    })
                  }
                />

              </Field>

            </div>

            {form.name &&
              form.packSize &&
              selectedUnit && (
                <div className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">

                  Product will appear as{" "}

                  <strong>
                    {form.name} -{" "}
                    {Number(
                      form.packSize
                    )}{" "}
                    {
                      selectedUnit.abbreviation
                    }
                  </strong>

                </div>
              )}

          </div>

          {/* DESCRIPTION */}

          <Field label="Description">

            <Input
              placeholder="Optional product description..."
              value={form.description}
              onChange={(e) =>
                setForm({
                  ...form,
                  description:
                    e.target.value,
                })
              }
            />

          </Field>

          {editingId && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700">
              Current stock is not editable
              here. Use purchases, sales,
              returns or stock adjustments
              to change inventory.
            </div>
          )}

          <Button
            type="submit"
            className="w-full rounded-xl py-3"
            disabled={saving}
          >
            {saving
              ? "Saving product..."
              : editingId
              ? "Save Changes"
              : "Create Product"}
          </Button>

        </form>

      </Modal>

      {/* =================================================
          STOCK ADJUSTMENT MODAL
      ================================================= */}

      <Modal
        open={!!adjustTarget}
        title={
          adjustTarget
            ? `Adjust Stock — ${displayName(
                adjustTarget
              )}`
            : "Adjust Stock"
        }
        onClose={() =>
          setAdjustTarget(null)
        }
      >

        {adjustTarget && (
          <form
            onSubmit={handleAdjust}
            className="space-y-5"
          >

            <div className="rounded-2xl bg-slate-900 p-5 text-white">

              <p className="text-xs font-medium text-slate-400">
                Current stock
              </p>

              <div className="mt-2 flex items-end justify-between">

                <p className="text-3xl font-bold">
                  {Number(
                    adjustTarget.currentStock
                  )}
                </p>

                <p className="pb-1 text-sm text-slate-400">
                  {
                    adjustTarget.unit
                      ?.abbreviation
                  }
                </p>

              </div>

            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

              <Field label="Action">

                <Select
                  value={
                    adjustForm.direction
                  }
                  onChange={(e) =>
                    setAdjustForm({
                      ...adjustForm,
                      direction:
                        e.target.value as
                          | "ADD"
                          | "REMOVE",
                    })
                  }
                >

                  <option value="ADD">
                    Add stock
                  </option>

                  <option value="REMOVE">
                    Remove stock
                  </option>

                </Select>

              </Field>

              <Field
                label={`Quantity (${
                  adjustTarget.unit
                    ?.abbreviation ?? ""
                })`}
              >

                <Input
                  type="number"
                  min={0}
                  step="any"
                  required
                  autoFocus
                  value={
                    adjustForm.quantity
                  }
                  onChange={(e) =>
                    setAdjustForm({
                      ...adjustForm,
                      quantity:
                        e.target.value,
                    })
                  }
                />

              </Field>

            </div>

            <Field label="Reason">

              <Input
                placeholder="e.g. Stock count correction"
                value={
                  adjustForm.reason
                }
                onChange={(e) =>
                  setAdjustForm({
                    ...adjustForm,
                    reason:
                      e.target.value,
                  })
                }
              />

            </Field>

            <div className="rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-500">
              This creates an inventory
              movement.
            </div>

            <Button
              type="submit"
              className="w-full rounded-xl py-3"
              disabled={adjusting}
            >
              {adjusting
                ? "Saving..."
                : "Apply Stock Adjustment"}
            </Button>

          </form>
        )}

      </Modal>

    </div>
  );
}