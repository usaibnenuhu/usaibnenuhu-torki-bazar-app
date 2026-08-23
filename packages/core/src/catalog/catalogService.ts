import { prisma } from "@torki-bazar/database";
import { PERMISSIONS, DuplicateError, NotFoundError, ValidationError } from "@torki-bazar/shared";
import type { AuthSession } from "../context";
import { assertPermission } from "../context";
import { recordAuditLog } from "../audit/auditService";

// ---- Categories ---------------------------------------------------------

export async function listCategories(includeArchived = false) {
  return prisma.category.findMany({
    where: includeArchived ? {} : { isArchived: false },
    include: { subcategories: { where: includeArchived ? {} : { isArchived: false } } },
    orderBy: { name: "asc" },
  });
}

export async function createCategory(session: AuthSession, name: string, description?: string) {
  assertPermission(session, PERMISSIONS.CATEGORIES_MANAGE);
  const existing = await prisma.category.findUnique({ where: { name } });
  if (existing) throw new DuplicateError(`Category "${name}" already exists.`);
  const category = await prisma.category.create({ data: { name, description } });
  await recordAuditLog(session, { action: "CREATE", module: "CATEGORY", recordId: category.id, newValue: category });
  return category;
}

export async function updateCategory(session: AuthSession, id: string, data: { name?: string; description?: string }) {
  assertPermission(session, PERMISSIONS.CATEGORIES_MANAGE);
  const before = await prisma.category.findUnique({ where: { id } });
  if (!before) throw new NotFoundError("Category not found.");
  const category = await prisma.category.update({ where: { id }, data });
  await recordAuditLog(session, { action: "UPDATE", module: "CATEGORY", recordId: id, previousValue: before, newValue: category });
  return category;
}

export async function deleteCategory(session: AuthSession, id: string) {
  assertPermission(session, PERMISSIONS.CATEGORIES_MANAGE);
  const category = await prisma.category.findUnique({
    where: { id },
    include: { subcategories: true, products: true },
  });
  if (!category) throw new NotFoundError("Category not found.");
  if (category.subcategories.length > 0 || category.products.length > 0) {
    throw new ValidationError("Cannot delete category containing subcategories or products.");
  }
  await prisma.category.delete({ where: { id } });
  await recordAuditLog(session, { action: "DELETE", module: "CATEGORY", recordId: id, previousValue: category });
}

export async function archiveCategory(session: AuthSession, id: string, isArchived = true) {
  assertPermission(session, PERMISSIONS.CATEGORIES_MANAGE);
  const category = await prisma.category.update({ where: { id }, data: { isArchived } });
  await recordAuditLog(session, { action: isArchived ? "ARCHIVE" : "UNARCHIVE", module: "CATEGORY", recordId: id });
  return category;
}

// ---- Subcategories -------------------------------------------------------

export async function createSubcategory(session: AuthSession, categoryId: string, name: string) {
  assertPermission(session, PERMISSIONS.CATEGORIES_MANAGE);
  const existing = await prisma.subcategory.findUnique({ where: { categoryId_name: { categoryId, name } } });
  if (existing) throw new DuplicateError(`Subcategory "${name}" already exists in this category.`);
  const subcategory = await prisma.subcategory.create({ data: { categoryId, name } });
  await recordAuditLog(session, { action: "CREATE", module: "SUBCATEGORY", recordId: subcategory.id, newValue: subcategory });
  return subcategory;
}

export async function deleteSubcategory(session: AuthSession, id: string) {
  assertPermission(session, PERMISSIONS.CATEGORIES_MANAGE);
  const subcategory = await prisma.subcategory.findUnique({
    where: { id },
    include: { products: true },
  });
  if (!subcategory) throw new NotFoundError("Subcategory not found.");
  if (subcategory.products.length > 0) {
    throw new ValidationError("Cannot delete subcategory containing products.");
  }
  await prisma.subcategory.delete({ where: { id } });
  await recordAuditLog(session, { action: "DELETE", module: "SUBCATEGORY", recordId: id, previousValue: subcategory });
}

export async function archiveSubcategory(session: AuthSession, id: string, isArchived = true) {
  assertPermission(session, PERMISSIONS.CATEGORIES_MANAGE);
  const subcategory = await prisma.subcategory.update({ where: { id }, data: { isArchived } });
  await recordAuditLog(session, { action: isArchived ? "ARCHIVE" : "UNARCHIVE", module: "SUBCATEGORY", recordId: id });
  return subcategory;
}

// ---- Brands ---------------------------------------------------------------

export async function listBrands(includeArchived = false) {
  return prisma.brand.findMany({ where: includeArchived ? {} : { isArchived: false }, orderBy: { name: "asc" } });
}

export async function createBrand(session: AuthSession, name: string) {
  assertPermission(session, PERMISSIONS.CATEGORIES_MANAGE);
  const existing = await prisma.brand.findUnique({ where: { name } });
  if (existing) throw new DuplicateError(`Brand "${name}" already exists.`);
  const brand = await prisma.brand.create({ data: { name } });
  await recordAuditLog(session, { action: "CREATE", module: "BRAND", recordId: brand.id, newValue: brand });
  return brand;
}

// ---- Units ------------------------------------------------------------------

export async function listUnits(includeArchived = false) {
  return prisma.unit.findMany({ where: includeArchived ? {} : { isArchived: false }, orderBy: { name: "asc" } });
}

export async function createUnit(session: AuthSession, name: string, abbreviation: string) {
  assertPermission(session, PERMISSIONS.CATEGORIES_MANAGE);
  const existing = await prisma.unit.findUnique({ where: { name } });
  if (existing) throw new DuplicateError(`Unit "${name}" already exists.`);
  const unit = await prisma.unit.create({ data: { name, abbreviation } });
  await recordAuditLog(session, { action: "CREATE", module: "UNIT", recordId: unit.id, newValue: unit });
  return unit;
}
