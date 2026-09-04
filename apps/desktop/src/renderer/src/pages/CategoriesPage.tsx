import { useEffect, useState } from "react";
import { call } from "../api/client";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Field, Input } from "../components/Form";
import { Modal } from "../components/Modal";
import { useToastStore } from "../store/toastStore";

interface Subcategory {
  id: string;
  name: string;
  isArchived: boolean;
}

interface Category {
  id: string;
  name: string;
  description?: string;
  subcategories: Subcategory[];
}

function PlusIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v5M14 11v5" />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H10l2 2h6.5A2.5 2.5 0 0 1 21 9.5v7A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5Z" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`transition-transform duration-200 ${
        open ? "rotate-180" : ""
      }`}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Category create/edit
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(
    null
  );
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [savingCategory, setSavingCategory] = useState(false);

  // Subcategory create/edit
  const [subModalOpen, setSubModalOpen] = useState(false);
  const [subModalCategoryId, setSubModalCategoryId] = useState<string | null>(
    null
  );
  const [editingSubcategory, setEditingSubcategory] =
    useState<Subcategory | null>(null);
  const [subName, setSubName] = useState("");
  const [savingSubcategory, setSavingSubcategory] = useState(false);

  // Delete confirmation
  const [deleteCategoryTarget, setDeleteCategoryTarget] =
    useState<Category | null>(null);

  const [deleteSubTarget, setDeleteSubTarget] = useState<{
    categoryId: string;
    subcategory: Subcategory;
  } | null>(null);

  const [deleting, setDeleting] = useState(false);

  // Expanded category cards
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const push = useToastStore((s) => s.push);

  async function load() {
    setLoading(true);

    try {
      const result = await call<Category[]>("catalog:categories:list");

      setCategories(result);

      // Open all categories by default
      const expandedState: Record<string, boolean> = {};

      result.forEach((category) => {
        expandedState[category.id] = true;
      });

      setExpanded(expandedState);
    } catch (err) {
      push(
        err instanceof Error
          ? err.message
          : "Failed to load categories",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // ------------------------------------------------------------
  // CREATE CATEGORY
  // ------------------------------------------------------------

  function openCreateCategory() {
    setEditingCategory(null);
    setCategoryName("");
    setCategoryDescription("");
    setCategoryModalOpen(true);
  }

  // ------------------------------------------------------------
  // EDIT CATEGORY
  // ------------------------------------------------------------

  function openEditCategory(category: Category) {
    setEditingCategory(category);
    setCategoryName(category.name);
    setCategoryDescription(category.description ?? "");
    setCategoryModalOpen(true);
  }

  async function handleSaveCategory(e: React.FormEvent) {
    e.preventDefault();

    const trimmedName = categoryName.trim();

    if (!trimmedName) {
      push("Category name is required.", "error");
      return;
    }

    setSavingCategory(true);

    try {
      if (editingCategory) {
        await call("catalog:categories:update", {
          id: editingCategory.id,
          name: trimmedName,
          description: categoryDescription.trim() || null,
        });

        push("Category updated successfully.", "success");
      } else {
        await call("catalog:categories:create", {
          name: trimmedName,
          description: categoryDescription.trim() || undefined,
        });

        push("Category created successfully.", "success");
      }

      setCategoryModalOpen(false);
      setEditingCategory(null);
      setCategoryName("");
      setCategoryDescription("");

      await load();
    } catch (err) {
      push(
        err instanceof Error
          ? err.message
          : "Failed to save category",
        "error"
      );
    } finally {
      setSavingCategory(false);
    }
  }

  // ------------------------------------------------------------
  // DELETE CATEGORY
  // ------------------------------------------------------------

  async function handleDeleteCategory() {
    if (!deleteCategoryTarget) return;

    setDeleting(true);

    try {
      await call("catalog:categories:delete", {
        id: deleteCategoryTarget.id,
      });

      push("Category deleted successfully.", "success");

      setDeleteCategoryTarget(null);

      await load();
    } catch (err) {
      push(
        err instanceof Error
          ? err.message
          : "Failed to delete category",
        "error"
      );
    } finally {
      setDeleting(false);
    }
  }

  // ------------------------------------------------------------
  // CREATE SUBCATEGORY
  // ------------------------------------------------------------

  function openCreateSubcategory(categoryId: string) {
    setSubModalCategoryId(categoryId);
    setEditingSubcategory(null);
    setSubName("");
    setSubModalOpen(true);
  }

  // ------------------------------------------------------------
  // EDIT SUBCATEGORY
  // ------------------------------------------------------------

  function openEditSubcategory(
    categoryId: string,
    subcategory: Subcategory
  ) {
    setSubModalCategoryId(categoryId);
    setEditingSubcategory(subcategory);
    setSubName(subcategory.name);
    setSubModalOpen(true);
  }

  async function handleSaveSubcategory(e: React.FormEvent) {
    e.preventDefault();

    if (!subModalCategoryId) return;

    const trimmedName = subName.trim();

    if (!trimmedName) {
      push("Subcategory name is required.", "error");
      return;
    }

    setSavingSubcategory(true);

    try {
      if (editingSubcategory) {
        await call("catalog:subcategories:update", {
          id: editingSubcategory.id,
          name: trimmedName,
        });

        push("Subcategory updated successfully.", "success");
      } else {
        await call("catalog:subcategories:create", {
          categoryId: subModalCategoryId,
          name: trimmedName,
        });

        push("Subcategory created successfully.", "success");
      }

      setSubModalOpen(false);
      setSubModalCategoryId(null);
      setEditingSubcategory(null);
      setSubName("");

      await load();
    } catch (err) {
      push(
        err instanceof Error
          ? err.message
          : "Failed to save subcategory",
        "error"
      );
    } finally {
      setSavingSubcategory(false);
    }
  }

  // ------------------------------------------------------------
  // DELETE SUBCATEGORY
  // ------------------------------------------------------------

  async function handleDeleteSubcategory() {
    if (!deleteSubTarget) return;

    setDeleting(true);

    try {
      await call("catalog:subcategories:delete", {
        id: deleteSubTarget.subcategory.id,
      });

      push("Subcategory deleted successfully.", "success");

      setDeleteSubTarget(null);

      await load();
    } catch (err) {
      push(
        err instanceof Error
          ? err.message
          : "Failed to delete subcategory",
        "error"
      );
    } finally {
      setDeleting(false);
    }
  }

  function toggleCategory(id: string) {
    setExpanded((current) => ({
      ...current,
      [id]: !current[id],
    }));
  }

  const totalSubcategories = categories.reduce(
    (total, category) => total + category.subcategories.length,
    0
  );

  return (
    <div className="min-h-full space-y-6 pb-10">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 shadow-sm">
              <FolderIcon />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Categories
              </h1>

              <p className="mt-0.5 text-sm text-slate-500">
                Organize your products into categories and subcategories.
              </p>
            </div>

          </div>
        </div>

        <Button
          onClick={openCreateCategory}
          className="inline-flex items-center justify-center gap-2 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
        >
          <PlusIcon />
          New Category
        </Button>

      </div>

      {/* ======================================================
          SUMMARY
      ====================================================== */}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Total Categories
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {categories.length}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              <FolderIcon />
            </div>

          </div>

        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Total Subcategories
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {totalSubcategories}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <svg
                width="19"
                height="19"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              >
                <path d="M8 6h13M8 12h13M8 18h13" />
                <path d="M3 6h.01M3 12h.01M3 18h.01" />
              </svg>
            </div>

          </div>

        </div>

      </div>

      {/* ======================================================
          CATEGORY LIST
      ====================================================== */}

      {loading ? (

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-52 animate-pulse rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="h-5 w-40 rounded bg-slate-100" />
              <div className="mt-5 h-3 w-24 rounded bg-slate-100" />
              <div className="mt-3 h-10 rounded-lg bg-slate-50" />
              <div className="mt-2 h-10 rounded-lg bg-slate-50" />
            </div>
          ))}

        </div>

      ) : categories.length === 0 ? (

        <Card className="border-dashed">

          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">

            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
              <FolderIcon />
            </div>

            <h3 className="mt-5 text-lg font-semibold text-slate-900">
              No categories yet
            </h3>

            <p className="mt-1 max-w-sm text-sm text-slate-500">
              Create your first category to start organizing your
              product catalog.
            </p>

            <Button
              onClick={openCreateCategory}
              className="mt-5 inline-flex items-center gap-2"
            >
              <PlusIcon />
              Create Category
            </Button>

          </div>

        </Card>

      ) : (

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">

          {categories.map((category) => {
            const isOpen = expanded[category.id] ?? true;

            return (
              <div
                key={category.id}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg"
              >

                {/* CATEGORY HEADER */}

                <div className="relative">

                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-500 via-brand-400 to-emerald-400" />

                  <div className="flex items-start justify-between gap-4 p-5">

                    <button
                      type="button"
                      onClick={() => toggleCategory(category.id)}
                      className="flex min-w-0 flex-1 items-start gap-3 text-left"
                    >

                      <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-transform duration-200 group-hover:scale-105">
                        <FolderIcon />
                      </div>

                      <div className="min-w-0">

                        <h3 className="truncate text-base font-bold text-slate-900">
                          {category.name}
                        </h3>

                        <p className="mt-1 text-xs text-slate-500">
                          {category.subcategories.length}{" "}
                          {category.subcategories.length === 1
                            ? "subcategory"
                            : "subcategories"}
                        </p>

                      </div>

                    </button>

                    <div className="flex shrink-0 items-center gap-1">

                      {/* EDIT */}

                      <button
                        type="button"
                        title="Edit category"
                        onClick={() => openEditCategory(category)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-700"
                      >
                        <EditIcon />
                      </button>

                      {/* DELETE */}

                      <button
                        type="button"
                        title="Delete category"
                        onClick={() => setDeleteCategoryTarget(category)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-red-50 hover:text-red-600"
                      >
                        <TrashIcon />
                      </button>

                      {/* CHEVRON */}

                      <button
                        type="button"
                        onClick={() => toggleCategory(category.id)}
                        className="ml-1 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-700"
                      >
                        <ChevronIcon open={isOpen} />
                      </button>

                    </div>

                  </div>

                  {category.description && (
                    <p className="px-5 pb-4 text-sm text-slate-500">
                      {category.description}
                    </p>
                  )}

                </div>

                {/* SUBCATEGORY AREA */}

                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >

                  <div className="overflow-hidden">

                    <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-4">

                      {/* ADD SUBCATEGORY */}

                      <button
                        type="button"
                        onClick={() =>
                          openCreateSubcategory(category.id)
                        }
                        className="mb-3 inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-brand-600 transition-colors hover:bg-brand-50"
                      >
                        <PlusIcon />
                        Add Subcategory
                      </button>

                      {category.subcategories.length === 0 ? (

                        <div className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-6 text-center">

                          <p className="text-sm text-slate-400">
                            No subcategories yet
                          </p>

                          <button
                            type="button"
                            onClick={() =>
                              openCreateSubcategory(category.id)
                            }
                            className="mt-1 text-xs font-medium text-brand-600 hover:underline"
                          >
                            Add the first one
                          </button>

                        </div>

                      ) : (

                        <div className="space-y-2">

                          {category.subcategories.map(
                            (subcategory) => (

                              <div
                                key={subcategory.id}
                                className="group/sub flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3.5 py-3 transition-all duration-200 hover:border-slate-300 hover:shadow-sm"
                              >

                                <div className="flex min-w-0 items-center gap-3">

                                  <div className="h-2 w-2 shrink-0 rounded-full bg-brand-500" />

                                  <span className="truncate text-sm font-medium text-slate-700">
                                    {subcategory.name}
                                  </span>

                                </div>

                                <div className="flex shrink-0 items-center gap-1 opacity-70 transition-opacity group-hover/sub:opacity-100">

                                  <button
                                    type="button"
                                    title="Edit subcategory"
                                    onClick={() =>
                                      openEditSubcategory(
                                        category.id,
                                        subcategory
                                      )
                                    }
                                    className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                                  >
                                    <EditIcon />
                                  </button>

                                  <button
                                    type="button"
                                    title="Delete subcategory"
                                    onClick={() =>
                                      setDeleteSubTarget({
                                        categoryId: category.id,
                                        subcategory,
                                      })
                                    }
                                    className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                                  >
                                    <TrashIcon />
                                  </button>

                                </div>

                              </div>

                            )
                          )}

                        </div>

                      )}

                    </div>

                  </div>

                </div>

              </div>
            );
          })}

        </div>

      )}

      {/* ======================================================
          CATEGORY CREATE / EDIT MODAL
      ====================================================== */}

      <Modal
        open={categoryModalOpen}
        title={
          editingCategory
            ? "Edit Category"
            : "Create New Category"
        }
        onClose={() => {
          if (!savingCategory) {
            setCategoryModalOpen(false);
          }
        }}
      >

        <form
          onSubmit={handleSaveCategory}
          className="space-y-5"
        >

          <Field label="Category name">

            <Input
              required
              autoFocus
              placeholder="e.g. Drinks & Beverages"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
            />

          </Field>

          <Field label="Description (optional)">

            <Input
              placeholder="Short description of this category"
              value={categoryDescription}
              onChange={(e) =>
                setCategoryDescription(e.target.value)
              }
            />

          </Field>

          <Button
            type="submit"
            className="w-full"
            disabled={savingCategory}
          >
            {savingCategory
              ? "Saving..."
              : editingCategory
              ? "Save Changes"
              : "Create Category"}
          </Button>

        </form>

      </Modal>

      {/* ======================================================
          SUBCATEGORY CREATE / EDIT MODAL
      ====================================================== */}

      <Modal
        open={subModalOpen}
        title={
          editingSubcategory
            ? "Edit Subcategory"
            : "Add Subcategory"
        }
        onClose={() => {
          if (!savingSubcategory) {
            setSubModalOpen(false);
          }
        }}
      >

        <form
          onSubmit={handleSaveSubcategory}
          className="space-y-5"
        >

          <Field label="Subcategory name">

            <Input
              required
              autoFocus
              placeholder="e.g. Soft Drinks"
              value={subName}
              onChange={(e) => setSubName(e.target.value)}
            />

          </Field>

          <Button
            type="submit"
            className="w-full"
            disabled={savingSubcategory}
          >
            {savingSubcategory
              ? "Saving..."
              : editingSubcategory
              ? "Save Changes"
              : "Create Subcategory"}
          </Button>

        </form>

      </Modal>

      {/* ======================================================
          DELETE CATEGORY CONFIRMATION
      ====================================================== */}

      <Modal
        open={!!deleteCategoryTarget}
        title="Delete Category?"
        onClose={() => {
          if (!deleting) {
            setDeleteCategoryTarget(null);
          }
        }}
      >

        <div className="space-y-5">

          <div className="flex gap-3 rounded-xl border border-red-100 bg-red-50 p-4">

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
              <TrashIcon />
            </div>

            <div>

              <p className="text-sm font-semibold text-red-900">
                Delete "{deleteCategoryTarget?.name}"?
              </p>

              <p className="mt-1 text-xs leading-5 text-red-700">
                This action cannot be undone. If products or
                subcategories are using this category, the system
                may prevent deletion.
              </p>

            </div>

          </div>

          <div className="flex gap-2">

            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              disabled={deleting}
              onClick={() => setDeleteCategoryTarget(null)}
            >
              Cancel
            </Button>

            <button
              type="button"
              disabled={deleting}
              onClick={handleDeleteCategory}
              className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {deleting ? "Deleting..." : "Delete Category"}
            </button>

          </div>

        </div>

      </Modal>

      {/* ======================================================
          DELETE SUBCATEGORY CONFIRMATION
      ====================================================== */}

      <Modal
        open={!!deleteSubTarget}
        title="Delete Subcategory?"
        onClose={() => {
          if (!deleting) {
            setDeleteSubTarget(null);
          }
        }}
      >

        <div className="space-y-5">

          <div className="flex gap-3 rounded-xl border border-red-100 bg-red-50 p-4">

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
              <TrashIcon />
            </div>

            <div>

              <p className="text-sm font-semibold text-red-900">
                Delete "{deleteSubTarget?.subcategory.name}"?
              </p>

              <p className="mt-1 text-xs leading-5 text-red-700">
                This subcategory will be removed from the
                category.
              </p>

            </div>

          </div>

          <div className="flex gap-2">

            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              disabled={deleting}
              onClick={() => setDeleteSubTarget(null)}
            >
              Cancel
            </Button>

            <button
              type="button"
              disabled={deleting}
              onClick={handleDeleteSubcategory}
              className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {deleting
                ? "Deleting..."
                : "Delete Subcategory"}
            </button>

          </div>

        </div>

      </Modal>

    </div>
  );
}